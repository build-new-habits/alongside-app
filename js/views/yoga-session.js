export function onMount() {
  mountSessionGuard({
    isActive: () => phase === "session" || phase === "rest",
    label:    "yoga session",
    onExit:   () => { savePartialSession(); resetSession(); router.navigate("reflect"); }
  });
  document.getElementById("ys-back-btn")?.addEventListener("click", () => {
    if (phase === "focus")    { resetSession(); router.navigate("intention"); }
    else if (phase === "duration") { phase = "focus";    rerender(); }
    else if (phase === "overview") { phase = "duration"; rerender(); }
  });

  document.getElementById("ys-exit-btn")?.addEventListener("click", () => {
    showExitConfirm();
  });

  document.querySelectorAll(".cs-focus-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedFocus = btn.dataset.focus;
      phase = "duration";
      rerender();
    });
  });

  // Overview: expand pose cards
  document.querySelectorAll(".gym-exercise-header[data-pose-index]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx    = btn.dataset.poseIndex;
      const detail = document.getElementById(`yoga-pose-detail-${idx}`);
      if (!detail) return;
      const isOpen = !detail.hidden;
      detail.hidden = isOpen;
      btn.setAttribute("aria-expanded", !isOpen);
      const chevron = btn.querySelector(".gym-card-chevron");
      if (chevron) chevron.style.transform = isOpen ? "" : "rotate(180deg)";
    });
  });

  // Overview: start session
  document.getElementById("ys-start-btn")?.addEventListener("click", () => {
    phase = "session";
    rerender();
  });

  document.querySelectorAll(".cs-duration-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMins = parseInt(btn.dataset.mins);
      sessionQueue = buildSession(selectedFocus, selectedMins);
      currentIndex = 0;
      creditsEarned = 0;
      timeRemaining = 0;
      phase = "overview";
      rerender();
    });
  });

  document.getElementById("ys-timer-btn")?.addEventListener("click", () => {
    const pose = sessionQueue[currentIndex];
    if (!timerRunning) startHoldTimer(pose?.holdSeconds || 30);
    else pauseHoldTimer();
    const btn = document.getElementById("ys-timer-btn");
    if (btn) {
      btn.textContent = timerRunning ? "Pause" : "Resume";
      btn.setAttribute("aria-label", timerRunning ? "Pause hold timer" : "Resume hold timer");
    }
  });

  document.getElementById("ys-next-btn")?.addEventListener("click", () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerRunning = false;
    advancePose();
  });

  document.getElementById("ys-skip-btn")?.addEventListener("click", () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerRunning  = false;
    timeRemaining = 0;
    currentIndex++;
    if (currentIndex >= sessionQueue.length) { finaliseSession(); rerender(); }
    else { phase = "session"; rerender(); }
  });

  document.getElementById("ys-rest-skip-btn")?.addEventListener("click", () => {
    if (restInterval) { clearInterval(restInterval); restInterval = null; }
    phase = "session";
    rerender();
  });

  document.getElementById("ys-reflect-btn")?.addEventListener("click", () => { resetSession(); router.navigate("reflect"); });
  document.getElementById("ys-home-btn")?.addEventListener("click", () => { resetSession(); router.navigate("intention"); });
}
