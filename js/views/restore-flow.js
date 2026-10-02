/**
 * js/views/restore-flow.js
 * 02 Oct 2026 v1
 *
 * W4-6 RESTORE-MOVE. Restore from a file, as one flow for Settings and for
 * onboarding (a new phone can restore straight after the two consents,
 * instead of answering the whole of getting started first).
 *
 *   file -> read -> locked? ask the password -> check -> confirm -> replace
 *
 * Nothing on the device changes until the person presses Restore from this
 * file. Every outcome is handed back through onMessage or onRestored, so
 * the screen that started it shows it where it can be seen (it was only
 * spoken to screen readers before).
 *
 * The password: after two wrong tries the dialog says plainly that a
 * forgotten password cannot be got round (by anybody, including us) and
 * suggests a file saved without one.
 *
 * Dialog ids and classes are the ones Settings used (settings-dialog,
 * #unlock-*, #confirm-*), so the existing styles and checks still apply.
 */
import { readRestoreFile, applyRestore, confirmMessage } from "../data/restore.js";
import { unlockText, isLocked } from "../data/file-lock.js";
import { healthAllowed } from "../data/health-consent.js";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const FORGOTTEN =
  "This file can't be opened without its password, and a forgotten password can't be got round by anybody, including us. " +
  "If you also saved a file without a password, restore that one instead.";

function dialogShell(id, titleId, inner, opener) {
  document.getElementById(id)?.remove();
  const dialog = document.createElement("div");
  dialog.id = id;
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", titleId);
  dialog.className = "settings-dialog";
  dialog.innerHTML = `<div class="settings-dialog__backdrop"></div><div class="settings-dialog__content">${inner}</div>`;
  document.body.appendChild(dialog);
  const close = () => { dialog.remove(); if (opener && opener.isConnected && opener.focus) opener.focus(); };
  dialog.addEventListener("keydown", e => {
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;
    const f = [...dialog.querySelectorAll("input, button")].filter(el => !el.disabled);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  (dialog.querySelector("input") || dialog.querySelector("button"))?.focus();
  return { dialog, close };
}

/**
 * Start from a File the person picked.
 * @param {File} file
 * @param {{ onRestored: (r:{healthCameAcross:boolean}) => void, onMessage: (msg:string) => void, opener?: Element }} cb
 */
export function restoreFromFile(file, cb) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => restoreFromText(String(reader.result || ""), cb);
  reader.onerror = () => cb.onMessage("That file could not be read, so nothing has been changed.");
  reader.readAsText(file);
}

export function restoreFromText(text, cb) {
  if (isLocked(text)) { askPassword(text, cb); return; }
  const read = readRestoreFile(text);
  if (!read.ok) { cb.onMessage(read.reason); return; }
  confirm(read, cb);
}

function askPassword(text, cb) {
  let misses = 0;
  const { dialog, close } = dialogShell("settings-unlock-dialog", "unlock-dialog-title", `
    <h2 class="settings-dialog__title" id="unlock-dialog-title">This file is locked</h2>
    <p class="settings-dialog__message">It was saved with a password. Nothing changes on this device until it is opened and you have said yes.</p>
    <div class="settings-field">
      <label class="settings-label" for="unlock-pw">Password for this file</label>
      <input class="settings-input" id="unlock-pw" type="password" autocomplete="current-password" aria-describedby="unlock-error">
    </div>
    <p class="settings-dialog__error" id="unlock-error" role="alert"></p>
    <div class="settings-dialog__actions">
      <button class="btn btn-ghost" id="unlock-cancel">Cancel</button>
      <button class="btn btn-primary" id="unlock-open">Open the file</button>
    </div>`, cb.opener);
  dialog.querySelector("#unlock-cancel").addEventListener("click", () => { close(); cb.onMessage("Nothing has been changed."); });
  const open = dialog.querySelector("#unlock-open");
  const err = dialog.querySelector("#unlock-error");
  open.addEventListener("click", async () => {
    open.disabled = true;
    open.textContent = "Opening…";
    const res = await unlockText(text, dialog.querySelector("#unlock-pw")?.value || "");
    open.disabled = false;
    open.textContent = "Open the file";
    if (!res.ok) {
      misses++;
      err.textContent = "";
      const say = misses >= 2 ? FORGOTTEN : res.reason;
      setTimeout(() => { err.textContent = say; }, 20);
      dialog.querySelector("#unlock-pw")?.focus();
      return;
    }
    dialog.remove();
    const read = readRestoreFile(res.text);
    if (!read.ok) { cb.onMessage(read.reason); return; }
    confirm(read, cb);
  });
}

function confirm(read, cb) {
  const msg = confirmMessage(read.summary, healthAllowed());
  const { dialog, close } = dialogShell("settings-confirm-dialog", "confirm-dialog-title", `
    <h2 class="settings-dialog__title" id="confirm-dialog-title">Restore from this file</h2>
    <p class="settings-dialog__message">${esc(msg)}</p>
    <div class="settings-dialog__actions">
      <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
      <button class="btn btn-danger" id="confirm-ok">Restore from this file</button>
    </div>`, cb.opener);
  dialog.querySelector("#confirm-cancel").addEventListener("click", () => { close(); cb.onMessage("Nothing has been changed."); });
  dialog.querySelector("#confirm-ok").addEventListener("click", () => {
    dialog.remove();
    const r = applyRestore(read.data);
    cb.onRestored(r || { healthCameAcross: true });
  });
}
