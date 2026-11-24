/**
 * tools/pg-relay-check.mjs
 * 24 Nov 2026 v1
 *
 * P-45. Runs docs/relay/relay.sql in a real PostgreSQL (PGlite, PostgreSQL 16 in
 * WebAssembly) and drives the five functions as Supabase's anon role would:
 * the tables can't be touched directly; each function checks what it is given.
 * Not in the verify-* loop (it needs @electric-sql/pglite):
 *   PGLITE=/path/to/node_modules/@electric-sql/pglite node tools/pg-relay-check.mjs
 */
import { readFileSync } from "node:fs";
const { PGlite } = await import(process.env.PGLITE ? process.env.PGLITE + "/dist/index.js" : "@electric-sql/pglite");
const sql = readFileSync(new URL("../docs/relay/relay.sql", import.meta.url), "utf8");
let fails = 0, passes = 0;
const ok = (n, c, d = "") => { console.log(`  ${c ? "PASS" : "FAIL"}  ${n}`); if (c) passes++; else { fails++; if (d) console.log("        " + d); } };
const db = new PGlite();
// As Supabase does: new tables and functions are granted to anon and authenticated by default.
await db.exec("create role anon nologin; create role authenticated nologin; grant usage on schema public to anon, authenticated; alter default privileges in schema public grant all on tables to anon, authenticated; alter default privileges in schema public grant all on functions to anon, authenticated;");
await db.exec(sql);
await db.exec(sql);   // again: safe to run twice
ok("0. runs, and runs again", true);
const A = "00000000-0000-4000-8000-000000000001", B = "00000000-0000-4000-8000-000000000002";
const owner = "x".repeat(43);
const hash = (await db.query(`select encode(sha256(convert_to($1,'UTF8')),'hex') h`, [owner])).rows[0].h;
const as = async (q, p = []) => { await db.exec("set role anon"); try { return (await db.query(q, p)).rows; } finally { await db.exec("reset role"); } };
const fails_ = async (q, p = []) => { try { await as(q, p); return false; } catch { return true; } };
ok("1. anon can't read either table", await fails_("select * from relay_channels") && await fails_("select * from relay_messages"));
ok("2. anon can't write either table", await fails_(`insert into relay_channels(id, owner_hash) values ('${B}', '${hash}')`));
ok("3. anon can't run the cleaner", await fails_("select relay_clean()"));
await db.exec("set role authenticated"); let authBlocked = false; try { await db.query("select relay_open(gen_random_uuid(), repeat('a',64))"); } catch { authBlocked = true; } await db.exec("reset role");
ok("3b. a signed-in role gets nothing either (the app has no sign-in)", authBlocked);
ok("4. open: true, then false for the same id", (await as("select relay_open($1,$2) r", [A, hash]))[0].r === true && (await as("select relay_open($1,$2) r", [A, hash]))[0].r === false);
ok("5. open refuses a hash that isn't one", (await as("select relay_open($1,$2) r", [B, "nope"]))[0].r === false);
const iv = "abcdefghijklmnop", body = "A".repeat(40);
const p1 = (await as("select relay_post($1,$2,$3) r", [A, iv, body]))[0].r;
ok("6. post: a number", p1 !== null);
ok("7. post refuses anything not sealed-looking", (await as("select relay_post($1,$2,$3) r", [A, iv, "<b>hello there friend</b>"]))[0].r === null && (await as("select relay_post($1,$2,$3) r", [A, "short", body]))[0].r === null);
ok("8. post to an unknown link: null", (await as("select relay_post($1,$2,$3) r", [B, iv, body]))[0].r === null);
const p2 = (await as("select relay_post($1,$2,$3) r", [A, iv, body + "B"]))[0].r;
let rows = await as("select * from relay_fetch($1, $2)", [A, 0]);
ok("9. fetch: both, in order", rows.length === 2 && rows[0].body === body);
ok("10. fetch after the first: the second", (await as("select * from relay_fetch($1, $2)", [A, p1])).length === 1);
ok("11. ack with the wrong secret: nothing deleted", (await as("select relay_ack($1,$2,$3) r", [A, "wrong", p2]))[0].r === 0);
ok("12. ack with the phone's secret: deleted here", (await as("select relay_ack($1,$2,$3) r", [A, owner, p1]))[0].r === 1 && (await as("select * from relay_fetch($1, 0)", [A])).length === 1);
for (let i = 0; i < 48; i++) await as("select relay_post($1,$2,$3)", [A, iv, body]);
ok("13. 50 messages at most on one link", (await as("select relay_post($1,$2,$3) r", [A, iv, body]))[0].r === null);
ok("14. close with the wrong secret: kept", (await as("select relay_close($1,$2) r", [A, "wrong"]))[0].r === false);
ok("15. close with its secret: the link and its messages gone", (await as("select relay_close($1,$2) r", [A, owner]))[0].r === true && (await db.query("select count(*)::int n from relay_messages")).rows[0].n === 0);
await as("select relay_open($1,$2)", [B, hash]); await as("select relay_post($1,$2,$3)", [B, iv, body]);
await db.exec(`update relay_channels set expires_at = now() - interval '1 second' where id = '${B}'`);
ok("16. an ended link: nothing to post, nothing to fetch", (await as("select relay_post($1,$2,$3) r", [B, iv, body]))[0].r === null && (await as("select * from relay_fetch($1, 0)", [B])).length === 0);
ok("17. the cleaner deletes it", (await db.query("select relay_clean() n")).rows[0].n >= 1 && (await db.query("select count(*)::int n from relay_channels")).rows[0].n === 0);
console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
