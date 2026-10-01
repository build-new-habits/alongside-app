/**
 * js/data/support-lines.js
 * 01 Oct 2026 v1
 *
 * SIGNPOST-STATIC. Free support, the same for everybody, triggered by
 * nothing. Shown at the foot of Wellbeing and on the journal screen.
 *
 * WHY STATIC. The feeling-word pathway the safeguarding policy v7
 * described was retired with the feeling words (FEELINGS-RETIRE), and
 * nothing replaced it. This does not read the check-in, the journal or
 * anything else: nobody is assessed, nothing decides whether it shows,
 * and so nothing can fail to show it. The safeguarding policy v8 says so.
 *
 * Checked on the organisations' own sites, 01 Oct 2026: Samaritans 116 123
 * (free, any time); Shout, text SHOUT to 85258 (free, any time, children
 * and adults); NHS 111 (urgent help, including mental health); 999.
 * Under-18s see their own list (views/under-18.js).
 */
export const SUPPORT_LINES = Object.freeze([
  { name: "Samaritans", what: "free, any time, about anything", label: "call 116 123", href: "tel:116123" },
  { name: "Shout", what: "free, any time, by text", label: "text SHOUT to 85258", href: "sms:85258?&body=SHOUT" },
  { name: "NHS 111", what: "urgent help that isn’t an emergency, including for your mental health", label: "call 111", href: "tel:111" },
  { name: "In an emergency", what: "", label: "call 999", href: "tel:999" },
]);

export function supportLinesHTML(id = "support-lines") {
  return `
    <section class="support-lines" data-support-lines aria-labelledby="${id}-h">
      <h2 class="support-lines__title" id="${id}-h">If you need to talk to someone</h2>
      <p class="support-lines__lede">These are free and confidential. You don’t need a reason.</p>
      <ul class="support-lines__list">
        ${SUPPORT_LINES.map(s => `
          <li><strong>${s.name}</strong>${s.what ? `, ${s.what}` : ""}:
            <a class="support-lines__link" href="${s.href}">${s.label}</a></li>`).join("")}
      </ul>
    </section>`;
}
