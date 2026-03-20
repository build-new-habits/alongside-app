/* =============================================================
   BNH OS — App Core
   app.js v1.0 | Build New Habits | March 2026
   ============================================================= */

import { supabase, signIn, signOut, getSession, getCurrentUser, db,
         subscribeToActivity, subscribeToTasks, subscribeToPhases } from './supabase.js';

// ── STATE ─────────────────────────────────────────────────────
export const state = {
  user:           null,    // current Supabase user
  displayName:    '',      // 'Graeme' or 'Sarah'
  view:           'home',  // active view
  productFilter:  'all',   // product filter on Home
  theme:          localStorage.getItem('bnh-theme') || 'dark',
  products:       [],
  criticalTasks:  [],
  recentActivity: [],
  overdueTasks:   [],
  subscriptions:  [],      // active Supabase realtime subs
  toasts:         [],
};

// ── USER DISPLAY NAMES ────────────────────────────────────────
// Maps Supabase user emails to friendly names
// UPDATE THESE to match the emails you used when creating accounts in Supabase
const USER_NAMES = {
  'buildnewhabits@outlook.com': 'Graeme',
  'sarahlbrady@hotmail.com': 'Sarah',
};

// Maps Supabase user UUIDs to display names (for activity feed)
// UPDATE THESE with the actual User UIDs from Supabase → Authentication → Users
// This avoids needing a join to auth.users which PostgREST cannot do directly
const USER_ID_NAMES = {
  'REPLACE_WITH_GRAEME_UUID': 'Graeme',
  'REPLACE_WITH_SARAH_UUID':  'Sarah',
};

// ── AVATAR COLOURS ────────────────────────────────────────────
const AVATAR_COLOURS = {
  'Graeme': '#0D7377',
  'Sarah':  '#7C3AED',
};

export function getAvatarColour(name) {
  return AVATAR_COLOURS[name] || '#64748B';
}

export function getInitials(name) {
  return (name || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── THEME ─────────────────────────────────────────────────────
export function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('bnh-theme', theme);
}

export function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const isDark = state.theme === 'dark';
  btn.innerHTML = isDark
    ? '<i class="fas fa-sun" aria-hidden="true"></i><span class="sr-only">Switch to light mode</span>'
    : '<i class="fas fa-moon" aria-hidden="true"></i><span class="sr-only">Switch to dark mode</span>';
}

// ── NAVIGATION ────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home',         label: 'Home',         icon: 'fas fa-home' },
  { id: 'products',     label: 'Products',     icon: 'fas fa-boxes' },
  { id: 'operations',   label: 'Operations',   icon: 'fas fa-briefcase' },
  { id: 'meetings',     label: 'Meetings',     icon: 'fas fa-users' },
  { id: 'docs',         label: 'Docs',         icon: 'fas fa-folder-open' },
  { id: 'reports',      label: 'Reports',      icon: 'fas fa-file-alt' },
];

export function navigate(viewId) {
  if (!NAV_ITEMS.find(n => n.id === viewId)) return;
  state.view = viewId;

  // Update sidebar nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === viewId);
    el.setAttribute('aria-current', el.dataset.view === viewId ? 'page' : 'false');
  });

  // Update bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === viewId);
    el.setAttribute('aria-current', el.dataset.view === viewId ? 'page' : 'false');
  });

  // Load view
  loadView(viewId);

  // Update page title
  const item = NAV_ITEMS.find(n => n.id === viewId);
  const titleEl = document.getElementById('page-title');
  if (titleEl && item) titleEl.textContent = item.label;

  // Announce to screen readers
  announce(`Navigated to ${item?.label || viewId}`);
}

async function loadView(viewId) {
  const container = document.getElementById('view-container');
  if (!container) return;

  // Show skeleton while loading
  container.innerHTML = buildSkeleton();

  try {
    const res  = await fetch(`views/${viewId}.html`);
    const html = await res.text();
    container.innerHTML = html;

    // Run view-specific init
    await initView(viewId);

    // Animate cards in
    container.querySelectorAll('.card, .stat-card, .product-card').forEach((el, i) => {
      el.classList.add('fade-up', `fade-up-delay-${Math.min(i + 1, 4)}`);
    });
  } catch (err) {
    container.innerHTML = buildErrorState(viewId);
    console.error(`Failed to load view: ${viewId}`, err);
  }
}

async function initView(viewId) {
  switch (viewId) {
    case 'home':       await initHome();       break;
    case 'products':   await initProducts();   break;
    case 'operations': await initOperations(); break;
    case 'meetings':   await initMeetings();   break;
    case 'docs':       await initDocs();       break;
    case 'reports':    await initReports();    break;
  }
}

// ── APP INIT ──────────────────────────────────────────────────
export async function initApp() {
  // Apply saved theme
  applyTheme(state.theme);

  // Check auth
  const session = await getSession();
  if (!session) {
    showAuth();
    return;
  }

  await bootWithSession(session);
}

async function bootWithSession(session) {
  state.user = session.user;
  state.displayName = USER_NAMES[session.user.email] || session.user.email;

  showApp();
  buildNav();
  updateUserDisplay();
  updateThemeButton();

  // Load initial data
  await Promise.all([
    loadProducts(),
    loadCriticalTasks(),
    loadRecentActivity(),
  ]);

  // Start at home
  navigate('home');

  // Subscribe to real-time updates
  setupRealtime();
}

// ── AUTH ──────────────────────────────────────────────────────
function showAuth() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app-screen').style.display  = 'none';

  const form = document.getElementById('auth-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = form.querySelector('[type="submit"]');
    const email = form.querySelector('#auth-email').value.trim();
    const pass  = form.querySelector('#auth-password').value;
    const errEl = document.getElementById('auth-error');

    btn.disabled = true;
    btn.textContent = 'Signing in…';
    errEl.textContent = '';

    try {
      const { session } = await signIn(email, pass);
      await bootWithSession(session);
    } catch (err) {
      errEl.textContent = 'Incorrect email or password. Please try again.';
      btn.disabled   = false;
      btn.textContent = 'Sign in';
    }
  });
}

function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display  = 'grid';
}

export async function handleSignOut() {
  // Clean up subscriptions
  state.subscriptions.forEach(sub => sub.unsubscribe());
  state.subscriptions = [];

  await signOut();
  showAuth();
  showToast('Signed out successfully');
}

// ── NAV BUILDER ───────────────────────────────────────────────
function buildNav() {
  // Sidebar nav
  const sidebarNav = document.getElementById('sidebar-nav');
  if (sidebarNav) {
    sidebarNav.innerHTML = NAV_ITEMS.map(item => `
      <button
        class="nav-item"
        data-view="${item.id}"
        aria-label="${item.label}"
        aria-current="false"
        onclick="window.App.navigate('${item.id}')"
      >
        <i class="${item.icon}" aria-hidden="true"></i>
        <span>${item.label}</span>
      </button>
    `).join('');
  }

  // Bottom nav (mobile)
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) {
    // Show only first 6 items (all of them)
    bottomNav.innerHTML = NAV_ITEMS.map(item => `
      <button
        class="bottom-nav-item"
        data-view="${item.id}"
        aria-label="${item.label}"
        aria-current="false"
        onclick="window.App.navigate('${item.id}')"
      >
        <i class="${item.icon} bottom-nav-icon" aria-hidden="true"></i>
        <span>${item.label}</span>
      </button>
    `).join('');
  }
}

// ── USER DISPLAY ──────────────────────────────────────────────
function updateUserDisplay() {
  const avatarEls = document.querySelectorAll('.sidebar-avatar');
  const nameEls   = document.querySelectorAll('.sidebar-user-name');
  const roleEls   = document.querySelectorAll('.sidebar-user-role');

  avatarEls.forEach(el => {
    el.textContent    = getInitials(state.displayName);
    el.style.background = getAvatarColour(state.displayName);
  });
  nameEls.forEach(el => el.textContent = state.displayName);
  roleEls.forEach(el => el.style.display = 'none');
}

// ── DATA LOADERS ──────────────────────────────────────────────
async function loadProducts() {
  try {
    state.products = await db.getProducts();
  } catch (err) {
    console.error('Failed to load products', err);
    state.products = [];
  }
}

async function loadCriticalTasks() {
  try {
    state.criticalTasks = await db.getCriticalTasks();
    updateCriticalBadge();
  } catch (err) {
    console.error('Failed to load critical tasks', err);
  }
}

async function loadRecentActivity() {
  try {
    state.recentActivity = await db.getRecentActivity(8);
  } catch (err) {
    console.error('Failed to load activity', err);
  }
}

function updateCriticalBadge() {
  const count = state.criticalTasks.length;
  document.querySelectorAll('.nav-badge.critical, .bottom-nav-badge').forEach(el => {
    el.textContent    = count;
    el.style.display  = count > 0 ? 'inline-block' : 'none';
  });
}

// ── REAL-TIME ─────────────────────────────────────────────────
function setupRealtime() {
  const actSub = subscribeToActivity(item => {
    state.recentActivity.unshift(item);
    state.recentActivity = state.recentActivity.slice(0, 8);
    refreshActivityFeed();
  });

  const taskSub = subscribeToTasks(payload => {
    if (payload.eventType === 'UPDATE' && payload.new.status === 'complete') {
      loadCriticalTasks(); // refresh critical count
    }
  });

  const phaseSub = subscribeToPhases(updatedPhase => {
    if (updatedPhase.status === 'complete') {
      handlePhaseComplete(updatedPhase);
    }
  });

  state.subscriptions.push(actSub, taskSub, phaseSub);
}

// ── VIEW INITIALISERS ─────────────────────────────────────────
async function initHome() {
  renderProductFilterStrip();
  await renderCriticalSection();
  await renderPhaseProgressStrip();
  await renderWorkstreamCards();
  renderActivityFeed();
  await renderOutstandingTasks();
}

async function initProducts() {
  renderProductCards();
}

async function initOperations() {
  renderOperationsWorkstreams();
}

async function initMeetings() {
  renderMeetingsList();
}

async function initDocs() {
  renderDocsLibrary();
}

async function initReports() {
  renderReportsList();
}

// ── PRODUCT FILTER STRIP ──────────────────────────────────────
function renderProductFilterStrip() {
  const el = document.getElementById('product-filter-strip');
  if (!el) return;

  const products = [
    { id: 'all',      name: 'All',              colour: null },
    { id: 'move',     name: 'Move',             colour: '#0D7377' },
    { id: 'athlete',  name: 'Athlete',          colour: '#7C3AED' },
    { id: 'life',     name: 'Life',             colour: '#059669' },
    { id: 'compass',  name: 'Compass',          colour: '#EA580C' },
    { id: 'savvy',    name: 'Savvy',            colour: '#0284C7' },
  ];

  el.innerHTML = products.map(p => `
    <button
      class="product-filter-btn ${state.productFilter === p.id ? 'active' : ''}"
      onclick="window.App.setProductFilter('${p.id}')"
      aria-pressed="${state.productFilter === p.id}"
      aria-label="Filter by ${p.id === 'all' ? 'all products' : 'Alongside: ' + p.name}"
    >
      ${p.colour ? `<span style="width:7px;height:7px;border-radius:50%;background:${p.colour};flex-shrink:0" aria-hidden="true"></span>` : ''}
      ${p.id === 'all' ? 'All' : p.name}
    </button>
  `).join('');
}

export function setProductFilter(filterId) {
  state.productFilter = filterId;
  renderProductFilterStrip();
  renderCriticalSection();
  renderPhaseProgressStrip();
  renderWorkstreamCards();
  renderActivityFeed();
  renderOutstandingTasks();
}

// ── CRITICAL SECTION ─────────────────────────────────────────
async function renderCriticalSection() {
  const el = document.getElementById('critical-section');
  if (!el) return;

  const tasks = state.criticalTasks;
  if (!tasks.length) { el.style.display = 'none'; return; }

  el.style.display = 'block';
  el.innerHTML = `
    <div class="critical-section" role="region" aria-label="Critical items">
      <div class="critical-header" aria-hidden="true">
        <i class="fas fa-exclamation-triangle"></i>
        <span style="font-size:var(--text-sm);font-weight:var(--weight-bold)">
          ${tasks.length} Critical Item${tasks.length > 1 ? 's' : ''}
        </span>
      </div>
      ${tasks.map(t => `
        <div class="critical-item">
          <i class="fas fa-arrow-right" style="font-size:10px;flex-shrink:0" aria-hidden="true"></i>
          <span style="flex:1">${escHtml(t.title)}</span>
          <span class="badge badge-critical">${t.due_date ? formatDate(t.due_date) : 'No date'}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ── ACTIVITY FEED ─────────────────────────────────────────────
function renderActivityFeed() {
  const el = document.getElementById('activity-feed');
  if (!el) return;

  if (!state.recentActivity.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon"><i class="fas fa-history"></i></div>
      <div class="empty-state-title">No activity yet</div>
      <div class="empty-state-body">Actions by you and Sarah will appear here in real time.</div>
    </div>`;
    return;
  }

  el.innerHTML = state.recentActivity.map(item => {
    // Resolve display name from user_id using the USER_ID_NAMES map
    // (avoids needing a join to auth.users which is not directly accessible)
    const name = USER_ID_NAMES[item.user_id] || state.displayName || 'Team';
    const colour = getAvatarColour(name);
    const initials = getInitials(name);
    return `
      <div class="activity-item" role="listitem">
        <div class="activity-avatar" style="background:${colour}" aria-hidden="true">${initials}</div>
        <div class="activity-content">
          <div class="activity-text">
            <strong>${escHtml(name)}</strong> ${formatAction(item.action)}
            <em>${escHtml(item.entity_title || '')}</em>
          </div>
          <div class="activity-meta">
            <time datetime="${item.created_at}">${timeAgo(item.created_at)}</time>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function refreshActivityFeed() {
  if (state.view === 'home') renderActivityFeed();
}

// ── OUTSTANDING TASKS ─────────────────────────────────────────
async function renderOutstandingTasks() {
  const el = document.getElementById('outstanding-tasks');
  if (!el) return;

  try {
    const tasks = await db.getOverdueTasks();
    if (!tasks.length) {
      el.innerHTML = `<div class="empty-state" style="padding:var(--space-6)">
        <div class="empty-state-icon"><i class="fas fa-check-circle" style="color:var(--phase-complete)"></i></div>
        <div class="empty-state-title">All clear</div>
      </div>`;
      return;
    }

    el.innerHTML = `<div role="list">` + tasks.slice(0, 10).map(t => `
      <div class="task-row" role="listitem">
        <input
          type="checkbox"
          class="checkbox-wrap"
          aria-label="Complete: ${escHtml(t.title)}"
          onchange="window.App.completeTask('${t.id}', this)"
          style="width:18px;height:18px;min-width:18px;min-height:18px;flex-shrink:0;margin-top:2px"
        >
        <div style="flex:1;min-width:0">
          <div class="task-text">${escHtml(t.title)}</div>
          <div class="task-meta">
            ${t.workstreams?.products?.name
              ? `<span class="badge badge-info" style="font-size:9px">${escHtml(t.workstreams.products.name)}</span>`
              : ''}
            ${t.workstreams?.name
              ? `<span style="font-size:var(--text-xs);color:var(--text-muted)">${escHtml(t.workstreams.name)}</span>`
              : ''}
            ${t.due_date
              ? `<span class="badge badge-critical" style="font-size:9px">Due ${formatDate(t.due_date)}</span>`
              : ''}
          </div>
        </div>
      </div>
    `).join('') + `</div>`;
  } catch (err) {
    console.error('Failed to render outstanding tasks', err);
  }
}

// ── PHASE PROGRESS STRIP ──────────────────────────────────────
async function renderPhaseProgressStrip() {
  const el = document.getElementById('phase-progress-strip');
  if (!el) return;

  try {
    // Get Move phases (primary product)
    const moveProduct = state.products.find(p => p.slug === 'move');
    if (!moveProduct) return;

    const phases = await db.getPhases(moveProduct.id);

    el.innerHTML = `
      <div class="phase-timeline" role="list" aria-label="Alongside: Move phase progress">
        ${phases.map(p => `
          <button
            class="phase-pill ${p.status}"
            role="listitem"
            onclick="window.App.navigate('products')"
            aria-label="Phase ${p.phase_number}: ${p.name} — ${p.status}"
            title="${p.name}"
          >
            ${p.status === 'complete'
              ? '<i class="fas fa-check" aria-hidden="true"></i>'
              : `<span aria-hidden="true" style="font-size:10px;font-weight:700">${p.phase_number}</span>`
            }
            <span class="truncate" style="max-width:120px">Ph${p.phase_number}: ${escHtml(p.name)}</span>
          </button>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Failed to render phase strip', err);
  }
}

// ── WORKSTREAM PROGRESS CARDS ─────────────────────────────────
async function renderWorkstreamCards() {
  const el = document.getElementById('workstream-cards');
  if (!el) return;
  el.innerHTML = buildSkeleton(3);

  try {
    const moveProduct = state.products.find(p => p.slug === 'move');
    if (!moveProduct) return;

    const workstreams = await db.getWorkstreams(moveProduct.id);

    const cardsHtml = await Promise.all(workstreams.map(async ws => {
      const tasks = await db.getTasks(ws.id);
      const total = tasks.length;
      const done  = tasks.filter(t => t.status === 'complete').length;
      const pct   = total ? Math.round((done / total) * 100) : 0;
      const next  = tasks.find(t => t.status !== 'complete');

      return `
        <div class="stat-card card-interactive fade-up"
             onclick="window.App.navigate('operations')"
             role="button"
             tabindex="0"
             aria-label="${ws.name} workstream: ${pct}% complete"
             onkeydown="if(event.key==='Enter'||event.key===' ')window.App.navigate('operations')">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)">
            <div class="stat-label">${escHtml(ws.name)}</div>
            <div style="font-size:var(--text-xl);font-weight:var(--weight-bold);color:${pct===100?'var(--phase-complete)':'var(--text-primary)'};font-family:var(--font-display);line-height:1">${pct}%</div>
          </div>
          <div class="progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${ws.name} progress">
            <div class="progress-bar-fill ${pct===100?'complete':''}" style="width:${pct}%"></div>
          </div>
          ${next ? `<div class="stat-sub truncate">Next: ${escHtml(next.title)}</div>` : '<div class="stat-sub" style="color:var(--phase-complete)">All complete</div>'}
        </div>
      `;
    }));

    el.innerHTML = cardsHtml.join('');
  } catch (err) {
    el.innerHTML = '';
    console.error('Failed to render workstream cards', err);
  }
}

// ── PRODUCT CARDS ─────────────────────────────────────────────
function renderProductCards() {
  const el = document.getElementById('product-cards-grid');
  if (!el) return;

  const PRODUCT_META = {
    'move':    { colour: '#0D7377', icon: 'fas fa-running',    tagline: 'Adaptive fitness coaching app' },
    'athlete': { colour: '#7C3AED', icon: 'fas fa-medal',      tagline: 'Serious performer tier' },
    'life':    { colour: '#059669', icon: 'fas fa-graduation-cap', tagline: 'Student independence coaching' },
    'compass': { colour: '#EA580C', icon: 'fas fa-compass',    tagline: 'Over 60s digital skills' },
    'savvy':   { colour: '#0284C7', icon: 'fas fa-star',       tagline: 'Under 16s digital capability' },
  };

  if (!state.products.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon"><i class="fas fa-boxes"></i></div>
      <div class="empty-state-title">No products yet</div>
    </div>`;
    return;
  }

  el.innerHTML = state.products.map((p, i) => {
    const meta = PRODUCT_META[p.slug] || { colour: '#64748B', icon: 'fas fa-box', tagline: '' };
    return `
      <div class="card product-card card-interactive fade-up fade-up-delay-${Math.min(i+1,4)}"
           style="--product-color:${meta.colour}"
           onclick="window.App.openProduct('${p.id}')"
           role="button" tabindex="0"
           aria-label="Alongside: ${p.name} — ${p.status}"
           onkeydown="if(event.key==='Enter'||event.key===' ')window.App.openProduct('${p.id}')">
        <div class="card-body" style="padding-left:calc(var(--space-5) + 4px)">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-3);margin-bottom:var(--space-3)">
            <div style="width:40px;height:40px;border-radius:var(--radius-md);background:${meta.colour}18;display:flex;align-items:center;justify-content:center;color:${meta.colour};font-size:18px;flex-shrink:0">
              <i class="${meta.icon}" aria-hidden="true"></i>
            </div>
            <span class="badge badge-${p.status}">${p.status}</span>
          </div>
          <div style="font-size:var(--text-md);font-weight:var(--weight-bold);color:var(--text-primary);margin-bottom:var(--space-1)">
            Alongside: ${escHtml(p.name)}
          </div>
          <div style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-4)">
            ${escHtml(meta.tagline)}
          </div>
          <div style="font-size:var(--text-xs);color:var(--text-muted)">
            ${escHtml(p.description || '')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

export function openProduct(productId) {
  // Navigate to products view and highlight this product
  navigate('products');
  // TODO: scroll to and expand the selected product
}

// ── TASK COMPLETION ───────────────────────────────────────────
export async function completeTask(taskId, checkboxEl) {
  try {
    const task = await db.completeTask(taskId, state.user.id);

    // Log activity
    await db.logActivity(state.user.id, 'task_complete', 'task', taskId, task.title);

    // Celebrate
    triggerTaskConfetti(checkboxEl);

    // Refresh outstanding tasks
    await renderOutstandingTasks();

    showToast(`Task complete — great work, ${state.displayName}`);

    // Check if this completes a phase
    checkPhaseCompletion(task.phase_id);

  } catch (err) {
    console.error('Failed to complete task', err);
    if (checkboxEl) checkboxEl.checked = false;
    showToast('Something went wrong. Please try again.', 'error');
  }
}

async function checkPhaseCompletion(phaseId) {
  if (!phaseId) return;
  try {
    const tasks = await supabase
      .from('tasks')
      .select('status')
      .eq('phase_id', phaseId);

    const all  = tasks.data || [];
    const done = all.filter(t => t.status === 'complete');

    if (all.length > 0 && all.length === done.length) {
      // All tasks in phase are complete — mark phase complete
      const phase = await db.updatePhaseStatus(phaseId, 'complete', state.user.id);
      handlePhaseComplete(phase);
    }
  } catch (err) {
    console.error('Phase completion check failed', err);
  }
}

// ── PHASE COMPLETION ──────────────────────────────────────────
function handlePhaseComplete(phase) {
  // Find the phase card on screen
  const phaseCard = document.querySelector(`[data-phase-id="${phase.id}"]`);

  // Fire the stamp animation
  if (phaseCard) {
    const stamp = phaseCard.querySelector('.stamp');
    if (stamp) {
      stamp.textContent = 'Complete';
      stamp.classList.add('animate');
    }
    phaseCard.classList.add('just-completed');
  }

  // Full-screen confetti
  triggerPhaseConfetti();

  // Log activity
  db.logActivity(state.user.id, 'phase_complete', 'phase', phase.id,
    `Phase ${phase.phase_number}: ${phase.name}`);

  // Offer report generation
  showToast(`Phase complete! Generate the report?`, 'phase', phase.id);

  showModal('phase-complete-modal', { phase });
}

// ── QUICK-ADD TASK ────────────────────────────────────────────
export function showQuickAdd() {
  const overlay = document.getElementById('quick-add-overlay');
  if (overlay) {
    overlay.classList.add('open');
    overlay.querySelector('#quick-add-title')?.focus();
  }
}

export function closeQuickAdd() {
  const overlay = document.getElementById('quick-add-overlay');
  if (overlay) overlay.classList.remove('open');
}

export async function submitQuickAdd(e) {
  if (e) e.preventDefault();
  const title = document.getElementById('quick-add-title')?.value.trim();
  if (!title) return;

  const workstreamId = document.getElementById('quick-add-workstream')?.value;
  const dueDate      = document.getElementById('quick-add-due')?.value;
  const isCritical   = document.getElementById('quick-add-critical')?.checked;

  try {
    const task = await db.createTask({
      title,
      workstream_id: workstreamId || null,
      due_date:      dueDate || null,
      is_critical:   isCritical || false,
      status:        'pending',
    });

    await db.logActivity(state.user.id, 'task_added', 'task', task.id, task.title);

    closeQuickAdd();
    showToast('Task added');

    if (isCritical) loadCriticalTasks();
    if (state.view === 'home') renderOutstandingTasks();

  } catch (err) {
    console.error('Failed to create task', err);
    showToast('Failed to add task', 'error');
  }
}

// ── CELEBRATIONS ─────────────────────────────────────────────
function triggerTaskConfetti(fromEl) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof confetti !== 'function') return;

  const rect   = fromEl?.getBoundingClientRect();
  const origin = rect
    ? { x: rect.left / window.innerWidth, y: rect.top / window.innerHeight }
    : { x: 0.5, y: 0.6 };

  confetti({
    particleCount: 45,
    spread: 60,
    origin,
    colors: ['#0D7377', '#2DD4BF', '#7C3AED', '#F8FAFC', '#EA580C'],
    scalar: 0.8,
    ticks: 150,
  });
}

function triggerPhaseConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof confetti !== 'function') return;

  const duration = 3000;
  const end      = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#0D7377', '#2DD4BF', '#7C3AED'],
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#0D7377', '#2DD4BF', '#EA580C'],
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

// ── TOAST ─────────────────────────────────────────────────────
export function showToast(message, type = 'success', phaseId = null) {
  const id       = Date.now();
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icon = type === 'error'   ? 'fa-exclamation-circle'
             : type === 'phase'   ? 'fa-certificate'
             : 'fa-check-circle';

  const actionHtml = (type === 'phase' && phaseId)
    ? `<button onclick="window.App.generatePhaseReport('${phaseId}')"
               style="margin-left:auto;background:var(--teal-600);color:white;border:none;border-radius:var(--radius-md);padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;min-height:var(--min-touch)">
         Generate report
       </button>`
    : '';

  const toast = document.createElement('div');
  toast.className   = 'toast';
  toast.id          = `toast-${id}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <i class="fas ${icon}" aria-hidden="true"
       style="color:${type==='error'?'var(--critical-text)':type==='phase'?'gold':'var(--teal-400)'}"></i>
    <span style="flex:1">${escHtml(message)}</span>
    ${actionHtml}
  `;

  container.appendChild(toast);

  const timeout = type === 'phase' ? 6000 : 3000;
  setTimeout(() => { toast.remove(); }, timeout);
}

// ── MODAL ─────────────────────────────────────────────────────
export function showModal(modalId, data = {}) {
  const overlay = document.getElementById(modalId + '-overlay');
  if (!overlay) return;

  // Populate dynamic content if needed
  if (data.phase) {
    const nameEl = overlay.querySelector('[data-modal-phase-name]');
    if (nameEl) nameEl.textContent = `Phase ${data.phase.phase_number}: ${data.phase.name}`;
  }

  overlay.classList.add('open');
  overlay.querySelector('[data-modal-primary]')?.focus();

  // Trap focus
  trapFocus(overlay);
}

export function closeModal(modalId) {
  const overlay = document.getElementById(modalId + '-overlay');
  if (overlay) overlay.classList.remove('open');
}

// ── REPORT GENERATION ─────────────────────────────────────────
export async function generatePhaseReport(phaseId) {
  showToast('Generating report…');
  try {
    // Gather phase data
    const phases  = await supabase.from('phases').select('*').eq('id', phaseId).single();
    const phase   = phases.data;
    const tasks   = await db.getTasksByPhase(phaseId);
    const notes   = await supabase.from('notes').select('*').eq('phase_id', phaseId);
    const docs    = await supabase.from('documents').select('*').eq('phase_id', phaseId);

    const reportData = {
      phase,
      tasks: tasks,
      notes: notes.data || [],
      docs:  docs.data  || [],
      generatedAt: new Date().toISOString(),
      generatedBy: state.displayName,
    };

    // Save to Supabase
    const report = await db.saveReport({
      type:         'phase_completion',
      title:        `Phase ${phase.phase_number}: ${phase.name} — Completion Report`,
      product_id:   phase.product_id,
      phase_id:     phaseId,
      generated_by: state.user.id,
      data:         reportData,
    });

    // Mark phase as report generated
    await supabase.from('phases').update({ report_generated: true }).eq('id', phaseId);

    showToast('Report saved — view in Reports');
    navigate('reports');

  } catch (err) {
    console.error('Report generation failed', err);
    showToast('Report generation failed', 'error');
  }
}

// ── ACCESSIBILITY HELPERS ─────────────────────────────────────
function announce(message) {
  let liveEl = document.getElementById('aria-live-region');
  if (!liveEl) {
    liveEl = document.createElement('div');
    liveEl.id = 'aria-live-region';
    liveEl.setAttribute('aria-live', 'polite');
    liveEl.setAttribute('aria-atomic', 'true');
    liveEl.className = 'sr-only';
    document.body.appendChild(liveEl);
  }
  liveEl.textContent = '';
  requestAnimationFrame(() => { liveEl.textContent = message; });
}

function trapFocus(element) {
  const focusable = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  element.addEventListener('keydown', function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
    if (!element.classList.contains('open')) element.removeEventListener('keydown', handler);
  });
}

// ── UTILITY HELPERS ───────────────────────────────────────────
export function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function timeAgo(isoStr) {
  const diff  = Date.now() - new Date(isoStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function formatAction(action) {
  const map = {
    'task_complete':  'completed',
    'task_added':     'added task',
    'note_added':     'added a note on',
    'doc_linked':     'linked a document to',
    'phase_complete': 'completed',
    'meeting_added':  'logged a meeting:',
  };
  return map[action] || action;
}

function buildSkeleton(count = 4) {
  return Array.from({ length: count }, () => `
    <div class="card" style="padding:var(--space-5)">
      <div class="skeleton" style="height:12px;width:40%;margin-bottom:var(--space-3)"></div>
      <div class="skeleton" style="height:20px;width:60%;margin-bottom:var(--space-4)"></div>
      <div class="skeleton" style="height:6px;width:100%"></div>
    </div>
  `).join('');
}

function buildErrorState(viewId) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon"><i class="fas fa-exclamation-circle"></i></div>
      <div class="empty-state-title">Failed to load ${viewId}</div>
      <div class="empty-state-body">Check your connection and try again.</div>
      <button class="btn btn-primary" onclick="window.App.navigate('${viewId}')" style="margin-top:var(--space-4)">
        Retry
      </button>
    </div>
  `;
}

// Stub renderers for views not yet built (filled in later sessions)
function renderOperationsWorkstreams() {}
function renderMeetingsList() {}
function renderDocsLibrary() {}
function renderReportsList() {}

// ── EXPOSE TO WINDOW (for inline handlers) ────────────────────
window.App = {
  navigate, setProductFilter, openProduct, completeTask,
  showQuickAdd, closeQuickAdd, submitQuickAdd,
  showModal, closeModal, generatePhaseReport,
  toggleTheme, handleSignOut, escHtml, formatDate,
};

// ── BOOT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initApp);
