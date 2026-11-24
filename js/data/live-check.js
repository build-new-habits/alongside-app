/**
 * data/live-check.js
 * 24 Nov 2026 v1
 *
 * P-45 THE LIVE LINK (spec docs/specs/alongside_physio-live-link_24nov2026_v1.md).
 * Collects what professionals sent through this phone's live links: for each
 * open link, the sealed messages since the last one, unsealed here with the
 * link's key, kept only if they read as changes sent back (a "back" plan),
 * then deleted from the relay (relay_ack). The Plan only; nothing at all
 * when the relay is not set up. Never throws: offline, it tries next time.
 *
 *   checkLive({ client, force }) -> how many new sets of changes came
 *   stopLive(id, { client })     -> closes it on the relay (best effort) and here
 */
import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { RELAY } from "./relay-config.js";
import { relayClient, unseal } from "./live-link.js";
import { decodePlan } from "./plan-link.js";

export const CHECK_EVERY_MS = 2 * 60 * 1000;
let lastCheck = 0;

export const liveOn = (client = relayClient(RELAY)) => client.on;

export async function checkLive({ client = relayClient(RELAY), force = false, now = Date.now() } = {}) {
  if (!client.on || !isPremium()) return 0;
  if (!force && now - lastCheck < CHECK_EVERY_MS) return 0;
  lastCheck = now;
  let added = 0;
  for (const link of store.get("liveLinks") || []) {
    let rows;
    try { rows = await client.fetchSince(link.id, link.after); } catch { continue; }
    if (!rows.length) continue;
    const items = [];
    let upto = link.after;
    for (const row of rows) {
      upto = Math.max(upto, row.id);
      const text = await unseal(link.key, row);
      if (!text) continue;
      const r = await decodePlan(text);
      if (!r.ok || r.plan.t !== "back") continue;
      items.push({ link: link.id, msg: row.id, code: text.replace(/^back=/, ""), at: new Date(now).toISOString(), noticed: false });
    }
    if (items.length) { store.addLiveInbox(items); added += items.length; }
    store.saveLiveLink({ ...link, after: upto });
    try { await client.ack(link.id, link.owner, upto); } catch { /* deleted at 30 days anyway */ }
  }
  return added;
}

export async function stopLive(id, { client = relayClient(RELAY) } = {}) {
  const link = (store.get("liveLinks") || []).find(l => l.id === id);
  if (!link) return false;
  let closed = false;
  try { closed = await client.close(link.id, link.owner); } catch { /* ends by itself at 90 days */ }
  store.removeLiveLink(id);
  return closed;
}

/** For the gate: forget when the last check was. */
export function _resetThrottle() { lastCheck = 0; }
