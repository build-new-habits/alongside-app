/**
 * welcome.js - Onboarding Step 1: Welcome screen
 */

export const centered = true;

export function render() {
  return `
    <div class="onboarding-view">
      <div class="onboarding-content">
        <div class="coach-greeting">
          <div class="coach-avatar">
            <img src="assets/images/logo-icon-small.png" alt="Coach" width="80" height="80">
          </div>
          <h1>Welcome to Alongside</h1>
          <p class="lead">I'm here to help you build movement habits that actually stick.</p>
        </div>
        
        <div class="welcome-message card card-coach">
          <p>No streaks. No shame. No "no pain, no gain."</p>
          <p>Just movement that adapts to your energy, your body, and your life.</p>
        </div>
        
        <div class="onboarding-features">
          <div class="feature">
            <span class="feature-icon">🎯</span>
            <span class="feature-text">Workouts that fit your actual schedule</span>
          </div>
          <div class="feature">
            <span class="feature-icon">💚</span>
            <span class="feature-text">Adapts when energy is low</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🛡️</span>
            <span class="feature-text">Respects injuries and conditions</span>
          </div>
        </div>
      </div>
      
      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="router.navigate('onboarding/name')">
          Let's get started
        </button>
        <p class="text-sm text-secondary text-center" style="margin-top: var(--space-4);">
          Takes about 3-4 minutes
        </p>
      </div>
    </div>
  `;
}
