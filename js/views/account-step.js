/**
 * js/views/account-step.js
 * 28 Nov 2026 v1
 *
 * Row 13a ACCOUNTS, S2. The email step, as the mock-up approved by Graeme
 * on 28 Nov 2026 (Product/alongside_accounts_mockup_28nov2026_v2.html):
 *   Screen 1  Your email (and Screen 4, offline, on the same screen)
 *   Screen 2  Check your email (Screen 3, a code that didn't work)
 *   Screen 6  Welcome back
 *   Screen 5  Use the code instead (AccountLinkView, the email's link
 *             opened somewhere Alongside wasn't waiting for it)
 * Reached only through the guard in router.navigate() (data/account.js
 * guardRoute), after the age question and the agreement.
 *
 * A11Y (WCAG 2.2 AA). Visible labels; the email keyboard and the phone's
 * own code suggestion (autocomplete one-time-code); errors in words, tied
 * to their field (aria-describedby, aria-invalid) and announced; focus to
 * the heading on each screen, to the field on an error; no timer on screen.
 */
import { store } from "../store.js";
import { account, sendCode, verifyCode, takePendingRoute, demoOn, DEMO_CODE, CODE_MINUTES } from "../data/account.js";
import { trialActive, endsOnWords } from "../data/plan-trial.js";

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const WORDS = Object.freeze({
  emailTitle: "Your email",
  emailWhy: "So you can move between Free and the Plan, and sign in on another phone. No password: we'll send you a code.",
  emailLabel: "Email address",
  onlyTitle: "We only use it to sign you in",
  onlyLine: "Your answers, check-ins and history stay on this phone. News from us comes in the app, in Messages.",
  send: "Send me a code",
  tryAgain: "Try again",
  codeTitle: "Check your email",
  codeLabel: "Code",
  signIn: "Sign in",
  another: "Send another code",
  different: "Use a different email",
  junk: "Not there? Check your junk or spam folder.",
  welcomeTitle: "Welcome back",
  historyTitle: "Your history is on your old phone",
  historyLine: "To bring it here, use Download your data there, and Restore here.",
  carryOn: "Carry on",
  howMove: "How to move my history",
  linkTitle: "Use the code instead",
  linkLine: "This link opened somewhere Alongside wasn't waiting for it.",
  linkCardTitle: "Go back to Alongside",
  linkCardLine: "Type the 6-digit code from the email there.",
});

export const SAY = Object.freeze({
  invalid: "That doesn't look like an email address. Check it and try again.",
  offline: "<strong>You need to be online for this step.</strong> Everything else works without a connection.",
  wait: s => `You can send another code in ${s} second${s === 1 ? "" : "s"}.`,
  tooMany: "That's a lot of codes for now. Try again a little later.",
  failed: "Something went wrong at our end. Try again in a minute.",
  format: "The code is 6 numbers. Check it and try again.",
  wrong: "<strong>That code didn't work.</strong> Check the 6 digits, or send another code.",
  newCode: "<strong>That code can't be used now.</strong> Send another code.",
  sent: "A new code is on its way.",
});

// A long address breaks after a dot or the @, never inside a word.
export const breakable = email => esc(email).replace(/([.@])/g, "$1<wbr>");
const sentLine = email => `We've sent a 6-digit code to <strong>${breakable(email)}</strong>. It works for ${CODE_MINUTES} minutes.`;
const demoLine = () => demoOn() ? `<p class="hc-text" id="ac-demo">Developer demo: the code is ${DEMO_CODE}. Nothing is sent anywhere.</p>` : "";

function nextRoute() {
  return takePendingRoute() || (store.get("onboardingComplete") === true ? "today" : "onboarding/start");
}

export function AccountStepView(router) {
  let stage = account().pending ? "code" : "email";
  let say = "", offline = false, welcome = false, bad = false;   // bad: the field itself is wrong

  function emailScreen() {
    const filled = account().pending?.email || account().email || "";
    return `
      <div class="view hc-view" id="ac-view" data-stage="email">
        <h1 class="hc-title" id="ac-title" tabindex="-1">${WORDS.emailTitle}</h1>
        <p class="hc-text">${WORDS.emailWhy}</p>
        <label class="form-label" for="ac-email">${WORDS.emailLabel}</label>
        <input class="form-input" id="ac-email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" maxlength="254" value="${esc(filled)}" aria-describedby="ac-error"${bad ? ' aria-invalid="true"' : ""}>
        <div class="ob-consent__note" id="ac-only"><p class="hc-text"><strong>${WORDS.onlyTitle}</strong></p>
<p class="hc-text">${WORDS.onlyLine}</p></div>
        <p class="hc-error" id="ac-error" role="alert">${say}</p>
        ${demoLine()}
        <button class="btn btn-primary btn-large btn-full" id="ac-send">${offline ? WORDS.tryAgain : WORDS.send}</button>
      </div>`;
  }

  function codeScreen() {
    const email = account().pending?.email || "";
    return `
      <div class="view hc-view" id="ac-view" data-stage="code">
        <button type="button" class="btn-inline-link" id="ac-back">‹ Back</button>
        <h1 class="hc-title" id="ac-title" tabindex="-1">${WORDS.codeTitle}</h1>
        <p class="hc-text" id="ac-sent">${sentLine(email)}</p>
        <label class="form-label" for="ac-code">${WORDS.codeLabel}</label>
        <input class="form-input" id="ac-code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="6" aria-describedby="ac-sent ac-error"${bad ? ' aria-invalid="true"' : ""}>
        <p class="hc-error" id="ac-error" role="alert">${say}</p>
        ${demoLine()}
        <button class="btn btn-primary btn-large btn-full" id="ac-sign-in">${WORDS.signIn}</button>
        <button type="button" class="btn btn-ghost btn-full" id="ac-another">${WORDS.another}</button>
        <button type="button" class="btn btn-ghost btn-full" id="ac-different">${WORDS.different}</button>
        <p class="hc-text">${WORDS.junk}</p>
      </div>`;
  }

  function welcomeScreen() {
    const paid = (account().tier === "personal");
    const plan = paid ? `<div class="ob-consent__note" id="ac-plan"><p class="hc-text"><strong>The Plan is on</strong></p></div>`
      : trialActive() ? `<div class="ob-consent__note" id="ac-plan"><p class="hc-text"><strong>The Plan is on</strong></p>
<p class="hc-text">Your free trial runs until ${esc(endsOnWords())}.</p></div>` : "";
    return `
      <div class="view hc-view" id="ac-view" data-stage="welcome">
        <h1 class="hc-title" id="ac-title" tabindex="-1">${WORDS.welcomeTitle}</h1>
        ${plan}
        <div class="ob-consent__note" id="ac-history"><p class="hc-text"><strong>${WORDS.historyTitle}</strong></p>
<p class="hc-text">${WORDS.historyLine}</p></div>
        <button class="btn btn-primary btn-large btn-full" id="ac-carry-on">${WORDS.carryOn}</button>
        <button type="button" class="btn btn-ghost btn-full" id="ac-how">${WORDS.howMove}</button>
      </div>`;
  }

  function draw(container, focusField = false) {
    container.innerHTML = welcome ? welcomeScreen() : stage === "code" ? codeScreen() : emailScreen();
    wire(container);
    const field = container.querySelector(stage === "code" ? "#ac-code" : "#ac-email");
    if (focusField && field && !welcome) field.focus();
    else container.querySelector("#ac-title")?.focus();
  }

  async function doSend(container, email) {
    const btn = container.querySelector("#ac-send, #ac-another");
    if (btn) btn.disabled = true;
    const r = await sendCode(email);
    offline = r.reason === "offline";
    bad = r.reason === "invalid";
    if (r.ok) { say = stage === "code" ? SAY.sent : ""; stage = "code"; draw(container, true); return; }
    say = r.reason === "wait" ? SAY.wait(r.seconds) : SAY[r.reason] || SAY.failed;
    draw(container, true);
  }

  function wire(container) {
    container.querySelector("#ac-send")?.addEventListener("click", () => doSend(container, container.querySelector("#ac-email")?.value || ""));
    container.querySelector("#ac-email")?.addEventListener("keydown", e => { if (e.key === "Enter") doSend(container, e.target.value); });
    container.querySelector("#ac-back")?.addEventListener("click", () => { stage = "email"; say = ""; offline = false; bad = false; draw(container); });
    container.querySelector("#ac-different")?.addEventListener("click", () => { stage = "email"; say = ""; offline = false; bad = false; draw(container, true); });
    container.querySelector("#ac-another")?.addEventListener("click", () => doSend(container, account().pending?.email || ""));
    const signIn = async () => {
      const btn = container.querySelector("#ac-sign-in");
      if (btn) btn.disabled = true;
      const r = await verifyCode(container.querySelector("#ac-code")?.value || "");
      if (r.ok) {
        say = "";
        if (r.welcomeBack) { welcome = true; draw(container); return; }
        router.navigate(nextRoute(), { replace: true });
        return;
      }
      say = SAY[r.reason] || SAY.failed;
      bad = ["format", "wrong", "newCode"].includes(r.reason);
      draw(container, true);
    };
    container.querySelector("#ac-sign-in")?.addEventListener("click", signIn);
    container.querySelector("#ac-code")?.addEventListener("keydown", e => { if (e.key === "Enter") signIn(); });
    container.querySelector("#ac-carry-on")?.addEventListener("click", () => router.navigate(nextRoute(), { replace: true }));
    container.querySelector("#ac-how")?.addEventListener("click", () => router.navigate("help"));
  }

  function mount(container) {
    if (typeof navigator !== "undefined" && navigator.onLine === false && stage === "email") { offline = true; say = SAY.offline; }
    draw(container);
  }
  return { mount };
}

export function AccountLinkView() {
  function mount(container) {
    container.innerHTML = `
      <div class="view hc-view" id="ac-view" data-stage="link">
        <h1 class="hc-title" id="ac-title" tabindex="-1">${WORDS.linkTitle}</h1>
        <p class="hc-text">${WORDS.linkLine}</p>
        <div class="ob-consent__note" id="ac-link-card"><p class="hc-text"><strong>${WORDS.linkCardTitle}</strong></p>
<p class="hc-text">${WORDS.linkCardLine}</p></div>
      </div>`;
    container.querySelector("#ac-title")?.focus();
  }
  return { mount };
}
