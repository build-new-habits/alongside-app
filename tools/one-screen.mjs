/**
 * tools/one-screen.mjs
 * 02 Oct 2026 v1
 *
 * W4-0 SUITE-TRUE. The app shows one screen at a time; a check that mounts
 * a view several times must do the same. Appending a fresh container while
 * the last one is still in the page leaves two elements with one id (two
 * onboarding threads, two Home screens). From jsdom 27, a lookup by id
 * inside a container answers from the page's id table and misses the
 * second copy, so five checks went red on a harness fault, not an app one
 * (verify-age-check, -consent2, -onboarding-characterisation, -clubshell,
 * -weight1b). oneScreen() takes earlier check containers out of the page
 * before attaching the new one. Taken-out containers stay readable.
 */
export function oneScreen(el) {
  const doc = el.ownerDocument;
  for (const n of [...doc.querySelectorAll("[data-check-screen]")]) n.remove();
  el.setAttribute("data-check-screen", "");
  doc.body.appendChild(el);
  return el;
}
