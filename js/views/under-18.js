/**
 * js/views/under-18.js
 * 02 Oct 2026 v3
 *
 * v3 - W4-17 U18-TRUE. No "it won't ask you again": it says how to start
 *   again at 18 (clear the app's data in the browser settings), which is
 *   what makes the app ask from the beginning.
 *
 * 01 Oct 2026 v2
 *
 * v2 - BUNDLE-TRUE. It says the one thing kept: that the person is under 18,
 *   so the app does not ask again. "Nothing you told the app has been kept"
 *   alone was not quite exact (independent check of the Foot Anstey bundle).
 *
 *
 * AGE-CHECK. What somebody who says they are under 18 sees, from then on,
 * on this phone. Reached only through the guard in router.navigate(); see
 * js/data/age-check.js.
 *
 * WHAT IT DOES. Says plainly that Alongside is for adults and why, without
 * blame; says nothing they told the app has been kept; and gives free,
 * confidential support for young people, checked on the organisations'
 * own sites on 01 Oct 2026: Childline 0800 1111 (anyone under 19 in the
 * UK, any time), Shout 85258 (children and adults, any time), NHS 111
 * (online for age 5 and over), and 999.
 *
 * WHAT IT DOES NOT DO. No way on into the app, no form, nothing stored
 * (the result itself is the only record, kept by age-check.js). The
 * privacy summary stays reachable, so they can read what was and was not
 * kept.
 */
export function Under18View(router) {
  function mount(container) {
    container.innerHTML = `
      <div class="view u18-view">
        <h1 class="u18-title" id="u18-title" tabindex="-1">Alongside is for adults</h1>
        <p class="u18-text">So I can’t be your coach. That isn’t about you. What Alongside
          suggests is written for adult bodies, and young people’s information
          deserves more care than this app was built to give.</p>
        <p class="u18-text">Nothing you told the app is kept on this phone. It remembers only that you said you are under 18, so it shows you this page.</p>
        <p class="u18-text">When you are 18, you can start again: clear this app\u2019s data in your phone\u2019s browser settings (the site is app.buildnewhabits.co.uk), and it will ask you from the beginning.</p>
        <p class="u18-text">If you’d like to move more, a PE teacher, your GP or a local club
          can help you find something that suits you.</p>

        <h2 class="u18-subtitle">If something is worrying you</h2>
        <p class="u18-text">These are free and confidential, and you don’t need a reason to get in touch.</p>
        <ul class="u18-list">
          <li><strong>Childline</strong>, any time, for anyone under 19:
            <a class="u18-link" href="tel:08001111">call 0800 1111</a>, or chat at
            <a class="u18-link" href="https://www.childline.org.uk/" target="_blank" rel="noopener noreferrer">childline.org.uk</a></li>
          <li><strong>Shout</strong>, any time:
            <a class="u18-link" href="sms:85258?&body=SHOUT">text SHOUT to 85258</a></li>
          <li><strong>NHS 111</strong>, for a health worry that is not an emergency:
            <a class="u18-link" href="tel:111">call 111</a> or go to
            <a class="u18-link" href="https://111.nhs.uk/" target="_blank" rel="noopener noreferrer">111.nhs.uk</a></li>
          <li>In an emergency, <a class="u18-link" href="tel:999">call 999</a>.</li>
        </ul>

        <p class="u18-small"><button type="button" class="btn-inline-link" id="u18-privacy">What this app keeps, and what it doesn’t</button></p>
      </div>`;
    container.querySelector("#u18-privacy")?.addEventListener("click", () => router.navigate("privacy"));
    container.querySelector("#u18-title")?.focus();
  }
  return { mount };
}
