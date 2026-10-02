/**
 * js/data/export-file.js
 * 02 Oct 2026 v1
 *
 * W4-17 U18-TRUE. The download file, built and saved on this device: the
 * same shape as Settings › Download your data (store + the other
 * 'alongside' keys), so Restore from a file reads it. Used by the age
 * question when somebody with history on the phone says they are under 18:
 * they are offered a copy before it is deleted. Settings keeps its own
 * copy of this (with the password option) until W4-23 moves it here.
 */

/** Everything the app keeps on this phone, as the download file's text. */
export function exportText() {
  const ls = globalThis.localStorage;
  const display = {};
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (k && k !== "alongside_user" && /^alongside/i.test(k)) display[k] = ls.getItem(k);
  }
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    about: "Everything Alongside: Move keeps about you on this device, including your journal. Nothing here was sent anywhere to make this file.",
    store: JSON.parse(ls.getItem("alongside_user") || "{}"),
    display,
  }, null, 2);
}

/** Save it as a file on this device. Returns the file name, or null. */
export function saveExport(doc = globalThis.document) {
  const name = `alongside-data-${new Date().toISOString().slice(0, 10)}.json`;
  try {
    const blob = new Blob([exportText()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = doc.createElement("a");
    a.href = url; a.download = name; a.hidden = true;
    doc.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return name;
  } catch { return null; }
}
