/**
 * data/live-link.js
 * 24 Nov 2026 v1
 *
 * P-45 THE PHYSIO LINK, Stage 2: the live link (spec
 * docs/specs/alongside_physio-live-link_24nov2026_v1.md; Graeme, 24 Nov:
 * "Stage 2 please"). Shared, byte for byte, by the app and the website's
 * edit-plan page (a gate compares them), so it imports nothing and touches
 * no store.
 *
 *   newLiveLink()            { id (uuid), key, owner }: made on the phone
 *   ownerHash(owner)         its SHA-256, hex: all the relay keeps of the secret
 *   seal(key, text)          AES-GCM 256 on this device: { iv, body }
 *   unseal(key, sealed)      the text, or null if the key is wrong or it was changed
 *   liveFragment(link)       "live=<id>.<key>" for after the # (never the owner)
 *   readLive(text)           { id, key } from a fragment, or null
 *   relayClient(config, fetch) the five calls to the relay, off when not set up
 *
 * The key travels only after the # (never sent to a server). The relay sees
 * the link's id and sealed bytes, never the key or the words.
 */

export const LIVE_DAYS = 90;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const KEY = /^[A-Za-z0-9_-]{43}$/;

const b64u = bytes => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const unb64u = s => {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
};
const random = n => crypto.getRandomValues(new Uint8Array(n));

export const isLiveId = id => typeof id === "string" && UUID.test(id);
export const isLiveKey = k => typeof k === "string" && KEY.test(k);

export function newLiveLink() {
  return { id: crypto.randomUUID(), key: b64u(random(32)), owner: b64u(random(32)) };
}

export async function ownerHash(owner) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(owner))));
  return [...d].map(b => b.toString(16).padStart(2, "0")).join("");
}

const aesKey = key => crypto.subtle.importKey("raw", unb64u(key), "AES-GCM", false, ["encrypt", "decrypt"]);

export async function seal(key, text) {
  if (!isLiveKey(key)) throw new Error("live-link: not a key");
  const iv = random(12);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(key), new TextEncoder().encode(String(text))));
  return { iv: b64u(iv), body: b64u(ct) };
}

export async function unseal(key, sealed) {
  try {
    if (!isLiveKey(key) || !sealed || !/^[A-Za-z0-9_-]{16}$/.test(sealed.iv) || !/^[A-Za-z0-9_-]{16,30000}$/.test(sealed.body)) return null;
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64u(sealed.iv) }, await aesKey(key), unb64u(sealed.body));
    return new TextDecoder().decode(pt);
  } catch { return null; }
}

export const liveFragment = link => `live=${link.id}.${link.key}`;

/** { id, key } from "live=<id>.<key>" (or a fragment holding "&live=..."), or null. */
export function readLive(text) {
  const m = /(?:^|[#&])live=([0-9a-f-]{36})\.([A-Za-z0-9_-]{43})(?:$|&)/.exec(String(text || ""));
  return m && isLiveId(m[1]) && isLiveKey(m[2]) ? { id: m[1], key: m[2] } : null;
}

/**
 * The relay's five calls (docs/relay/relay.sql), through Supabase's RPC. config:
 * { url, anonKey }; when either is empty the client is off and makes no call.
 * Each call returns its result, or throws.
 */
export function relayClient(config = {}, fetchImpl = globalThis.fetch) {
  const url = typeof config.url === "string" ? config.url.replace(/\/+$/, "") : "";
  const anonKey = typeof config.anonKey === "string" ? config.anonKey : "";
  const on = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) && anonKey.length > 20;
  async function rpc(name, args) {
    if (!on) throw new Error("live-link: the relay is not set up");
    const res = await fetchImpl(`${url}/rest/v1/rpc/${name}`, {
      method: "POST", credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store",
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    if (!res.ok) throw new Error(`live-link: ${name} ${res.status}`);
    return res.json();
  }
  return {
    on,
    open: async (id, hash) => (await rpc("relay_open", { p_channel: id, p_owner_hash: hash })) === true,
    post: async (id, sealed) => rpc("relay_post", { p_channel: id, p_iv: sealed.iv, p_body: sealed.body }),
    fetchSince: async (id, after = 0) => {
      const rows = await rpc("relay_fetch", { p_channel: id, p_after: after });
      return Array.isArray(rows) ? rows.filter(r => r && Number.isInteger(r.id)) : [];
    },
    ack: async (id, owner, upto) => rpc("relay_ack", { p_channel: id, p_owner: owner, p_upto: upto }),
    close: async (id, owner) => (await rpc("relay_close", { p_channel: id, p_owner: owner })) === true,
  };
}
