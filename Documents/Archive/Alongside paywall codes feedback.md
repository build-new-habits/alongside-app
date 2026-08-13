# ALONGSIDE: Paywall, Codes & Feedback Systems

> ## ⚠️ SUPERSEDED PRICING — SAFE TO IGNORE
>
> **This document quotes £9.99/month and/or £89/year. Those figures are retired.**
>
> **The confirmed price is £7.99 a month, or £49.99 for the year** (launch rate to
> the end of November 2026; £59.99/year thereafter; beta conversion £39.99/year).
> Source: `Documents/Business/alongside_pricing_model_20jun2026_v2.docx` §1,
> confirmed by Graeme on 13 August 2026.
>
> Nothing else in this document is affected — the reasoning, research and
> structure still stand and are worth reading. Only the numbers are old news.
> The document is kept intact rather than edited so the thinking that produced
> the change stays legible.


## Technical Specification v1.0 | January 2026

---

# PART 1: SUBSCRIPTION TIERS & ACCESS CONTROL

## Tier Definitions

| Tier ID | Name | Monthly | Annual | Access Level |
|---------|------|---------|--------|--------------|
| `free` | Free | £0 | £0 | Limited |
| `founding-monthly` | Founding Member (Monthly) | £5.99 | - | Full |
| `founding-annual` | Founding Member (Annual) | - | £49 | Full |
| `personal-monthly` | Personal (Monthly) | £9.99 | - | Full |
| `personal-annual` | Personal (Annual) | - | £89 | Full |

## User Subscription Schema

```json
{
  "subscription": {
    "oderId": "sub_abc123",
    "tier": "founding-annual",
    "status": "active",
    "startDate": "2026-04-15T00:00:00Z",
    "currentPeriodEnd": "2027-04-15T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "foundingMember": true,
    "acquiredVia": "friend-code",
    "friendCodeUsed": "ALONGSIDE-GRAEME-7X2K",
    "referredBy": "user_graeme_001",
    "trialEnd": "2026-07-15T00:00:00Z",
    "paymentMethod": "stripe",
    "stripeCustomerId": "cus_xyz789"
  }
}
```

---

## Feature Access Matrix

| Feature | Free | Founding/Personal |
|---------|------|-------------------|
| **Onboarding** | ✅ Full | ✅ Full |
| **Daily check-in** | ✅ Full | ✅ Full |
| **Burnout detection** | ✅ Full (NEVER gated) | ✅ Full |
| **Safety messaging** | ✅ Full (NEVER gated) | ✅ Full |
| **Conditions tracked** | 2 max | Unlimited |
| **Programmes available** | 4 starter | All (20+) |
| **Sessions per week** | 4 max | Unlimited |
| **Coach personality** | Steady only | All 4 |
| **Exercise library** | 30 core | 100+ full |
| **Progress view** | Basic (7-day) | Full (90-day) |
| **History access** | 30 days | Unlimited |
| **Goals** | 1 active | Unlimited |
| **Equipment types** | Basic | All |
| **Menstrual tracking** | Basic | Full integration |
| **Data export** | ❌ No | ✅ Yes |
| **Progress photos** | ❌ No | ✅ Yes |
| **Custom programmes** | ❌ No | ✅ Yes |
| **Friend codes** | ❌ No | ✅ 10 codes |

---

## Access Control Implementation

### Feature Gate Function

```javascript
// js/engines/access.js

const FeatureAccess = {
  
  // Features that are NEVER gated (safety-critical)
  NEVER_GATED: [
    'burnout-detection',
    'recovery-mode',
    'safety-messaging',
    'basic-checkin',
    'condition-pain-tracking',
    'crisis-resources'
  ],
  
  // Features with limits for free tier
  FREE_LIMITS: {
    'conditions': 2,
    'programmes': ['gentle-start', 'morning-mobility', 'desk-worker-relief', 'stress-relief-basics'],
    'sessions-per-week': 4,
    'coach-personalities': ['steady'],
    'exercises': 30,
    'history-days': 30,
    'goals': 1
  },
  
  // Check if user can access feature
  canAccess(feature, user) {
    // Safety features always accessible
    if (this.NEVER_GATED.includes(feature)) {
      return { allowed: true, reason: null };
    }
    
    // Check subscription status
    const tier = user.subscription?.tier || 'free';
    const isPaid = ['founding-monthly', 'founding-annual', 'personal-monthly', 'personal-annual'].includes(tier);
    const isInTrial = this.isInTrial(user);
    
    if (isPaid || isInTrial) {
      return { allowed: true, reason: null };
    }
    
    // Free tier - check specific limits
    return this.checkFreeLimit(feature, user);
  },
  
  // Check free tier limits
  checkFreeLimit(feature, user) {
    switch (feature) {
      case 'add-condition':
        const currentConditions = user.profile?.conditions?.length || 0;
        if (currentConditions >= this.FREE_LIMITS.conditions) {
          return {
            allowed: false,
            reason: 'condition-limit',
            message: `Free accounts can track up to ${this.FREE_LIMITS.conditions} conditions. Upgrade to track more.`,
            limit: this.FREE_LIMITS.conditions,
            current: currentConditions
          };
        }
        return { allowed: true };
        
      case 'start-session':
        const sessionsThisWeek = this.countSessionsThisWeek(user);
        if (sessionsThisWeek >= this.FREE_LIMITS['sessions-per-week']) {
          return {
            allowed: false,
            reason: 'session-limit',
            message: `You've completed ${sessionsThisWeek} sessions this week. Free accounts include ${this.FREE_LIMITS['sessions-per-week']} sessions per week.`,
            limit: this.FREE_LIMITS['sessions-per-week'],
            current: sessionsThisWeek
          };
        }
        return { allowed: true };
        
      case 'select-programme':
        // Handled by programme selection UI
        return { allowed: true };
        
      case 'change-coach':
        return {
          allowed: false,
          reason: 'coach-limit',
          message: 'Free accounts use the Steady coach. Upgrade to choose from all 4 coaching styles.'
        };
        
      case 'view-history':
        // Limited to 30 days, enforced in history view
        return { allowed: true, limit: this.FREE_LIMITS['history-days'] };
        
      case 'export-data':
      case 'progress-photos':
      case 'custom-programme':
        return {
          allowed: false,
          reason: 'paid-feature',
          message: 'This feature is available with a paid subscription.'
        };
        
      default:
        return { allowed: true };
    }
  },
  
  // Check if user is in trial period
  isInTrial(user) {
    if (!user.subscription?.trialEnd) return false;
    return new Date(user.subscription.trialEnd) > new Date();
  },
  
  // Count sessions completed this week
  countSessionsThisWeek(user) {
    const startOfWeek = this.getStartOfWeek();
    return (user.sessions || []).filter(s => 
      new Date(s.completedAt) >= startOfWeek
    ).length;
  },
  
  getStartOfWeek() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(now.setDate(diff));
  }
};

export default FeatureAccess;
```

---

### Paywall UI Component

```javascript
// js/components/paywall.js

const Paywall = {
  
  // Show upgrade prompt (soft gate)
  showUpgradePrompt(reason, context = {}) {
    const prompts = {
      'session-limit': {
        title: `You've completed ${context.current} sessions this week! 🎉`,
        body: `Free accounts include ${context.limit} sessions per week. You're clearly building a great habit.`,
        cta: 'See upgrade options',
        secondary: "I'm good for this week"
      },
      'condition-limit': {
        title: 'Track more conditions',
        body: `Free accounts can track up to ${context.limit} conditions. Upgrade to track all your conditions in one place.`,
        cta: 'Learn more',
        secondary: 'Maybe later'
      },
      'coach-limit': {
        title: 'Choose your coaching style',
        body: 'Free accounts use the Steady coach. Upgrade to choose from Steady, Energetic, Minimal, or Nurturing.',
        cta: 'Explore coaching styles',
        secondary: 'Keep Steady for now'
      },
      'programme-limit': {
        title: 'Unlock all programmes',
        body: 'Free accounts include 4 starter programmes. Upgrade to access 20+ programmes including injury recovery, strength building, and more.',
        cta: 'See all programmes',
        secondary: 'Browse free programmes'
      },
      'paid-feature': {
        title: 'This is a paid feature',
        body: context.message || 'Upgrade to access this feature.',
        cta: 'See upgrade options',
        secondary: 'Maybe later'
      }
    };
    
    const prompt = prompts[reason] || prompts['paid-feature'];
    
    return `
      <div class="paywall-prompt" role="dialog" aria-labelledby="paywall-title">
        <div class="paywall-content">
          <h2 id="paywall-title">${prompt.title}</h2>
          <p>${prompt.body}</p>
          
          <div class="paywall-actions">
            <button class="btn btn-primary" onclick="Paywall.showPricing()">
              ${prompt.cta}
            </button>
            <button class="btn btn-text" onclick="Paywall.dismiss()">
              ${prompt.secondary}
            </button>
          </div>
        </div>
      </div>
    `;
  },
  
  // Show pricing page
  showPricing() {
    // Navigate to pricing view
    App.navigate('pricing');
  },
  
  // Dismiss prompt
  dismiss() {
    document.querySelector('.paywall-prompt')?.remove();
    // Record dismissal for frequency limiting
    this.recordDismissal();
  },
  
  // Limit prompt frequency
  canShowPrompt() {
    const lastDismissal = localStorage.getItem('paywall_last_dismissal');
    if (!lastDismissal) return true;
    
    const hoursSince = (Date.now() - parseInt(lastDismissal)) / (1000 * 60 * 60);
    return hoursSince >= 48; // 48 hour cooldown
  },
  
  recordDismissal() {
    localStorage.setItem('paywall_last_dismissal', Date.now().toString());
  },
  
  // NEVER show during these states
  shouldSuppress(user) {
    const checkin = user.todayCheckin;
    if (!checkin) return false;
    
    // Never show if mood is low
    if (checkin.mood <= 4) return true;
    
    // Never show if in recovery mode
    if (user.recoveryMode?.active) return true;
    
    // Never show if burnout detected
    if (user.burnoutDetected) return true;
    
    return false;
  }
};

export default Paywall;
```

---

# PART 2: FRIEND CODES SYSTEM

## Friend Code Schema

```json
{
  "friendCode": {
    "code": "ALONGSIDE-GRAEME-7X2K",
    "createdBy": "user_graeme_001",
    "createdAt": "2026-04-15T10:00:00Z",
    "tier": "founding",
    "status": "active",
    "usedBy": null,
    "usedAt": null,
    "expiresAt": null
  }
}
```

## User's Friend Codes Schema

```json
{
  "userFriendCodes": {
    visitorId": "user_graeme_001",
    "totalAllocated": 10,
    "totalUsed": 3,
    "totalRemaining": 7,
    "replenishThreshold": 5,
    "codes": [
      {
        "code": "ALONGSIDE-GRAEME-7X2K",
        "status": "used",
        "usedBy": "user_sarah_042",
        "usedAt": "2026-04-20T14:30:00Z"
      },
      {
        "code": "ALONGSIDE-GRAEME-9M3P",
        "status": "active",
        "usedBy": null,
        "usedAt": null
      }
      // ... more codes
    ]
  }
}
```

---

## Friend Code Implementation

```javascript
// js/engines/friendCodes.js

const FriendCodes = {
  
  CODE_PREFIX: 'ALONGSIDE',
  INITIAL_ALLOCATION: 10,
  REPLENISH_AMOUNT: 5,
  REPLENISH_THRESHOLD: 5, // When they've used 5, give 5 more
  
  // Generate a unique friend code
  generate(userId, userName) {
    const namePart = this.sanitizeName(userName).toUpperCase().slice(0, 8);
    const randomPart = this.randomString(4).toUpperCase();
    const code = `${this.CODE_PREFIX}-${namePart}-${randomPart}`;
    
    return {
      code,
      createdBy: oderId,
      createdAt: new Date().toISOString(),
      tier: 'founding',
      status: 'active',
      usedBy: null,
      usedAt: null,
      expiresAt: null
    };
  },
  
  // Sanitize name for code
  sanitizeName(name) {
    return name.replace(/[^a-zA-Z]/g, '').slice(0, 8) || 'FRIEND';
  },
  
  // Generate random string
  randomString(length) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // Initialize codes for new Founding Member
  initializeForUser(userId, userName) {
    const codes = [];
    for (let i = 0; i < this.INITIAL_ALLOCATION; i++) {
      codes.push(this.generate(userId, userName));
    }
    
    return {
      oderId: oderId,
      totalAllocated: this.INITIAL_ALLOCATION,
      totalUsed: 0,
      totalRemaining: this.INITIAL_ALLOCATION,
      codes
    };
  },
  
  // Validate a friend code
  validate(code) {
    // Look up code in database
    const codeRecord = this.findCode(code);
    
    if (!codeRecord) {
      return {
        valid: false,
        error: 'invalid-code',
        message: "This code doesn't exist. Please check and try again."
      };
    }
    
    if (codeRecord.status === 'used') {
      return {
        valid: false,
        error: 'already-used',
        message: 'This code has already been used.'
      };
    }
    
    if (codeRecord.expiresAt && new Date(codeRecord.expiresAt) < new Date()) {
      return {
        valid: false,
        error: 'expired',
        message: 'This code has expired.'
      };
    }
    
    return {
      valid: true,
      code: codeRecord,
      benefit: 'Founding Member pricing: £49/year or £5.99/month for life'
    };
  },
  
  // Redeem a friend code
  redeem(code, newUserId) {
    const validation = this.validate(code);
    if (!validation.valid) {
      return validation;
    }
    
    const codeRecord = validation.code;
    
    // Mark code as used
    codeRecord.status = 'used';
    codeRecord.usedBy = newUserId;
    codeRecord.usedAt = new Date().toISOString();
    
    // Update the code creator's stats
    this.updateCreatorStats(codeRecord.createdBy);
    
    // Grant Founding Member status to new user
    this.grantFoundingMemberStatus(newUserId, code, codeRecord.createdBy);
    
    return {
      success: true,
      message: 'Welcome to Alongside! You now have Founding Member access.',
      benefit: 'founding-member',
      referredBy: codeRecord.createdBy
    };
  },
  
  // Update stats and potentially replenish codes
  updateCreatorStats(creatorId) {
    const userCodes = this.getUserCodes(creatorId);
    userCodes.totalUsed += 1;
    userCodes.totalRemaining -= 1;
    
    // Check if we should replenish
    if (userCodes.totalUsed % this.REPLENISH_THRESHOLD === 0) {
      this.replenishCodes(creatorId, userCodes);
    }
    
    this.saveUserCodes(creatorId, userCodes);
  },
  
  // Replenish codes when threshold reached
  replenishCodes(userId, userCodes) {
    const user = Store.getUser(userId);
    const userName = user?.profile?.name || 'FRIEND';
    
    for (let i = 0; i < this.REPLENISH_AMOUNT; i++) {
      userCodes.codes.push(this.generate(userId, userName));
    }
    
    userCodes.totalAllocated += this.REPLENISH_AMOUNT;
    userCodes.totalRemaining += this.REPLENISH_AMOUNT;
    
    // Notify user they have new codes
    this.notifyReplenishment(userId, this.REPLENISH_AMOUNT);
  },
  
  // Grant Founding Member status
  grantFoundingMemberStatus(userId, codeUsed, referredBy) {
    const user = Store.getUser(userId);
    
    user.subscription = {
      oderId: null, // Will be set when they choose monthly/annual
      tier: 'founding-trial', // Special trial tier
      status: 'trialing',
      startDate: new Date().toISOString(),
      trialEnd: this.calculateTrialEnd(), // 3 months
      foundingMember: true,
      acquiredVia: 'friend-code',
      friendCodeUsed: codeUsed,
      referredBy: referredBy
    };
    
    // Also initialize their own friend codes
    user.friendCodes = this.initializeForUser(userId, user.profile?.name);
    
    Store.saveUser(userId, user);
  },
  
  // Calculate 3-month trial end
  calculateTrialEnd() {
    const trialEnd = new Date();
    trialEnd.setMonth(trialEnd.getMonth() + 3);
    return trialEnd.toISOString();
  },
  
  // Get user's available codes for sharing
  getShareableCodes(userId) {
    const userCodes = this.getUserCodes(userId);
    return userCodes.codes.filter(c => c.status === 'active');
  },
  
  // Notify user of replenishment (in-app)
  notifyReplenishment(userId, amount) {
    Notifications.add(userId, {
      type: 'friend-codes-replenished',
      title: `${amount} new friend codes!`,
      message: `Your friends are loving Alongside! Here are ${amount} more codes to share.`,
      action: 'view-codes'
    });
  },
  
  // Database helpers (implement based on your storage)
  findCode(code) {
    // In localStorage version:
    const allCodes = JSON.parse(localStorage.getItem('alongside_friend_codes') || '{}');
    return allCodes[code];
  },
  
  getUserCodes(userId) {
    const userCodes = JSON.parse(localStorage.getItem(`alongside_user_codes_${userId}`) || 'null');
    return userCodes;
  },
  
  saveUserCodes(userId, data) {
    localStorage.setItem(`alongside_user_codes_${userId}`, JSON.stringify(data));
  }
};

export default FriendCodes;
```

---

## Friend Code UI

### Share Codes Screen

```javascript
// js/views/friendCodes.js

const FriendCodesView = {
  
  render(user) {
    const codes = FriendCodes.getShareableCodes(user.id);
    const userCodes = FriendCodes.getUserCodes(user.id);
    
    return `
      <div class="friend-codes-view">
        <header class="view-header">
          <h1>Share Alongside</h1>
          <p class="subtitle">Give friends the same Founding Member pricing you have</p>
        </header>
        
        <section class="codes-summary card">
          <div class="summary-stat">
            <span class="stat-number">${userCodes.totalRemaining}</span>
            <span class="stat-label">codes available</span>
          </div>
          <div class="summary-stat">
            <span class="stat-number">${userCodes.totalUsed}</span>
            <span class="stat-label">friends joined</span>
          </div>
        </section>
        
        <section class="codes-info card">
          <h2>What friends get</h2>
          <ul class="benefit-list">
            <li>✓ 3 months completely free</li>
            <li>✓ Then £49/year or £5.99/month for life</li>
            <li>✓ Same full access you have</li>
            <li>✓ Their own codes to share</li>
          </ul>
        </section>
        
        <section class="codes-list">
          <h2>Your codes</h2>
          ${codes.map(code => this.renderCodeCard(code)).join('')}
        </section>
        
        ${userCodes.totalUsed > 0 ? this.renderUsedCodes(userCodes) : ''}
      </div>
    `;
  },
  
  renderCodeCard(code) {
    return `
      <div class="code-card card">
        <code class="code-text">${code.code}</code>
        <div class="code-actions">
          <button class="btn btn-secondary" onclick="FriendCodesView.copyCode('${code.code}')">
            Copy code
          </button>
          <button class="btn btn-text" onclick="FriendCodesView.shareCode('${code.code}')">
            Share
          </button>
        </div>
      </div>
    `;
  },
  
  renderUsedCodes(userCodes) {
    const used = userCodes.codes.filter(c => c.status === 'used');
    return `
      <section class="used-codes">
        <h2>Friends who joined</h2>
        <p class="success-message">🎉 ${used.length} people joined because of you!</p>
        <p class="note">When you've shared 5 codes, you'll get 5 more automatically.</p>
      </section>
    `;
  },
  
  copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
      Toast.show('Code copied!');
    });
  },
  
  shareCode(code) {
    const shareText = `I've been using Alongside - a fitness app that actually gets it. No streaks, no shame, just movement that adapts to how you feel.

Use my code to get Founding Member pricing:
${code}

Sign up at: alongside.app`;

    if (navigator.share) {
      navigator.share({
        title: 'Join me on Alongside',
        text: shareText
      });
    } else {
      // Fallback: copy share text
      navigator.clipboard.writeText(shareText);
      Toast.show('Share text copied!');
    }
  }
};

export default FriendCodesView;
```

### Redeem Code Screen (New User)

```javascript
// js/views/redeemCode.js

const RedeemCodeView = {
  
  render() {
    return `
      <div class="redeem-code-view">
        <header class="view-header">
          <h1>Got a friend code?</h1>
          <p>Enter it below to unlock Founding Member pricing</p>
        </header>
        
        <form class="code-form" onsubmit="RedeemCodeView.submit(event)">
          <div class="input-group">
            <label for="friend-code">Friend code</label>
            <input 
              type="text" 
              id="friend-code" 
              name="code"
              placeholder="ALONGSIDE-NAME-XXXX"
              autocapitalize="characters"
              pattern="ALONGSIDE-[A-Z]+-[A-Z0-9]{4}"
            />
            <span class="input-hint">Looks like: ALONGSIDE-SARAH-7X2K</span>
          </div>
          
          <div id="code-result" class="code-result" aria-live="polite"></div>
          
          <button type="submit" class="btn btn-primary btn-full">
            Apply code
          </button>
        </form>
        
        <div class="no-code">
          <p>Don't have a code?</p>
          <a href="#pricing">See regular pricing</a>
        </div>
      </div>
    `;
  },
  
  async submit(event) {
    event.preventDefault();
    const code = document.getElementById('friend-code').value.toUpperCase().trim();
    const resultDiv = document.getElementById('code-result');
    
    // Validate format first
    if (!code.startsWith('ALONGSIDE-')) {
      resultDiv.innerHTML = `<p class="error">Codes start with ALONGSIDE-</p>`;
      return;
    }
    
    // Check code
    const validation = FriendCodes.validate(code);
    
    if (!validation.valid) {
      resultDiv.innerHTML = `<p class="error">${validation.message}</p>`;
      return;
    }
    
    // Show success and benefit
    resultDiv.innerHTML = `
      <div class="success">
        <p class="success-title">✓ Valid code!</p>
        <p class="success-benefit">${validation.benefit}</p>
      </div>
    `;
    
    // Store code for use after account creation
    sessionStorage.setItem('pending_friend_code', code);
    
    // Continue to signup
    setTimeout(() => {
      App.navigate('signup', { friendCode: code });
    }, 1500);
  }
};

export default RedeemCodeView;
```

---

# PART 3: PERSONAL INVITES SYSTEM

## For Beta Launch - Direct Invites

### Invite Schema

```json
{
  "invite": {
    "id": "inv_abc123",
    "email": "sarah@example.com",
    "name": "Sarah",
    "invitedBy": "graeme",
    "invitedAt": "2026-04-01T10:00:00Z",
    "status": "pending",
    "tier": "founding",
    "personalMessage": "Hey Sarah, I built this thinking of our conversations about ADHD and exercise. Would love your feedback!",
    "claimedAt": null,
    "userId": null
  }
}
```

### Invite System Implementation

```javascript
// js/engines/invites.js

const Invites = {
  
  // Create a personal invite
  create(options) {
    const { email, name, invitedBy, personalMessage } = options;
    
    const invite = {
      id: `inv_${this.generateId()}`,
      email: email.toLowerCase(),
      name,
      invitedBy,
      invitedAt: new Date().toISOString(),
      status: 'pending',
      tier: 'founding',
      personalMessage: personalMessage || null,
      claimedAt: null,
      visitorId: null,
      token: this.generateToken()
    };
    
    this.save(invite);
    return invite;
  },
  
  // Generate unique invite link
  getInviteLink(invite) {
    return `https://alongside.app/join/${invite.token}`;
  },
  
  // Validate invite token
  validateToken(token) {
    const invite = this.findByToken(token);
    
    if (!invite) {
      return { valid: false, error: 'Invite not found' };
    }
    
    if (invite.status === 'claimed') {
      return { valid: false, error: 'This invite has already been used' };
    }
    
    return { valid: true, invite };
  },
  
  // Claim invite (when user signs up)
  claim(token, userId) {
    const invite = this.findByToken(token);
    if (!invite) return { success: false };
    
    invite.status = 'claimed';
    invite.claimedAt = new Date().toISOString();
    invite.visitorId = userId;
    
    this.save(invite);
    
    // Grant Founding Member status
    this.grantAccess(userId, invite);
    
    return { success: true, invite };
  },
  
  // Grant access based on invite
  grantAccess(userId, invite) {
    const user = Store.getUser(userId);
    
    user.subscription = {
      tier: 'founding-trial',
      status: 'trialing',
      startDate: new Date().toISOString(),
      trialEnd: this.calculateTrialEnd(3), // 3 months
      foundingMember: true,
      acquiredVia: 'personal-invite',
      inviteId: invite.id,
      invitedBy: invite.invitedBy
    };
    
    // Initialize friend codes for them too
    user.friendCodes = FriendCodes.initializeForUser(userId, user.profile?.name);
    
    Store.saveUser(userId, user);
  },
  
  calculateTrialEnd(months) {
    const end = new Date();
    end.setMonth(end.getMonth() + months);
    return end.toISOString();
  },
  
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  },
  
  generateToken() {
    return Math.random().toString(36).substr(2, 12);
  },
  
  // Storage helpers
  save(invite) {
    const invites = JSON.parse(localStorage.getItem('alongside_invites') || '{}');
    invites[invite.id] = invite;
    invites[`token_${invite.token}`] = invite.id; // Index by token
    localStorage.setItem('alongside_invites', JSON.stringify(invites));
  },
  
  findByToken(token) {
    const invites = JSON.parse(localStorage.getItem('alongside_invites') || '{}');
    const inviteId = invites[`token_${token}`];
    return inviteId ? invites[inviteId] : null;
  }
};

export default Invites;
```

---

### Admin Invite UI (For You)

```javascript
// js/views/admin/invites.js

const AdminInvitesView = {
  
  render() {
    const invites = this.getAllInvites();
    
    return `
      <div class="admin-invites-view">
        <header>
          <h1>Manage Invites</h1>
          <button class="btn btn-primary" onclick="AdminInvitesView.showCreateForm()">
            + Create Invite
          </button>
        </header>
        
        <section class="invite-stats">
          <div class="stat">
            <span class="number">${invites.filter(i => i.status === 'pending').length}</span>
            <span class="label">Pending</span>
          </div>
          <div class="stat">
            <span class="number">${invites.filter(i => i.status === 'claimed').length}</span>
            <span class="label">Claimed</span>
          </div>
        </section>
        
        <section class="invite-list">
          ${invites.map(inv => this.renderInviteRow(inv)).join('')}
        </section>
        
        <div id="create-form-modal" class="modal hidden"></div>
      </div>
    `;
  },
  
  renderInviteRow(invite) {
    const statusClass = invite.status === 'claimed' ? 'success' : 'pending';
    return `
      <div class="invite-row card">
        <div class="invite-info">
          <strong>${invite.name || invite.email}</strong>
          <span class="email">${invite.email}</span>
          <span class="status ${statusClass}">${invite.status}</span>
        </div>
        <div class="invite-actions">
          ${invite.status === 'pending' ? `
            <button class="btn btn-small" onclick="AdminInvitesView.copyLink('${invite.token}')">
              Copy link
            </button>
            <button class="btn btn-small btn-text" onclick="AdminInvitesView.sendEmail('${invite.id}')">
              Send email
            </button>
          ` : `
            <span class="claimed-date">Joined ${this.formatDate(invite.claimedAt)}</span>
          `}
        </div>
      </div>
    `;
  },
  
  showCreateForm() {
    const modal = document.getElementById('create-form-modal');
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Create Personal Invite</h2>
        <form onsubmit="AdminInvitesView.createInvite(event)">
          <div class="input-group">
            <label for="invite-email">Email *</label>
            <input type="email" id="invite-email" required />
          </div>
          <div class="input-group">
            <label for="invite-name">Name</label>
            <input type="text" id="invite-name" />
          </div>
          <div class="input-group">
            <label for="invite-message">Personal message (optional)</label>
            <textarea id="invite-message" rows="3" 
              placeholder="Hey! I built this thinking of you..."></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-text" onclick="AdminInvitesView.closeModal()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Create Invite
            </button>
          </div>
        </form>
      </div>
    `;
    modal.classList.remove('hidden');
  },
  
  createInvite(event) {
    event.preventDefault();
    
    const invite = Invites.create({
      email: document.getElementById('invite-email').value,
      name: document.getElementById('invite-name').value,
      invitedBy: 'graeme', // Admin user
      personalMessage: document.getElementById('invite-message').value
    });
    
    this.closeModal();
    this.render(); // Refresh list
    
    // Show success with link
    const link = Invites.getInviteLink(invite);
    Toast.show(`Invite created! Link: ${link}`);
  },
  
  copyLink(token) {
    const link = `https://alongside.app/join/${token}`;
    navigator.clipboard.writeText(link);
    Toast.show('Invite link copied!');
  },
  
  async sendEmail(inviteId) {
    // In a real implementation, this would call your email service
    // For now, open email client with pre-filled content
    const invites = JSON.parse(localStorage.getItem('alongside_invites') || '{}');
    const invite = invites[inviteId];
    const link = Invites.getInviteLink(invite);
    
    const subject = encodeURIComponent("You're invited to Alongside");
    const body = encodeURIComponent(`Hi ${invite.name || 'there'},

${invite.personalMessage || "I've been building a fitness app that I think you'd really appreciate."}

It's called Alongside - fitness coaching designed for people who've been let down by traditional fitness culture. No streaks, no shame, just movement that adapts to how you actually feel.

As a Founding Member, you get:
• 3 months completely free
• Then £49/year for life (normally £89)
• Your own codes to share with friends

Join here: ${link}

Looking forward to hearing what you think!`);
    
    window.location.href = `mailto:${invite.email}?subject=${subject}&body=${body}`;
  },
  
  closeModal() {
    document.getElementById('create-form-modal').classList.add('hidden');
  },
  
  getAllInvites() {
    const data = JSON.parse(localStorage.getItem('alongside_invites') || '{}');
    return Object.values(data).filter(item => item.id); // Filter out token indices
  },
  
  formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short' 
    });
  }
};

export default AdminInvitesView;
```

---

# PART 4: FEEDBACK SYSTEM

## Feedback Types

| Type | When | Purpose |
|------|------|---------|
| Quick Feedback | Anytime (button in app) | Bug reports, suggestions |
| Session Feedback | After each session | Exercise difficulty, enjoyment |
| Fortnightly Survey | Every 2 weeks (beta) | Structured feedback collection |
| NPS Check | Monthly | Would you recommend? |
| Exit Survey | On cancellation | Why are you leaving? |

---

## Quick Feedback (In-App Button)

### Schema

```json
{
  "feedback": {
    "id": "fb_abc123",
    "userId": "user_sarah_042",
    "type": "quick",
    "submittedAt": "2026-04-20T15:30:00Z",
    "category": "bug",
    "rating": null,
    "message": "The timer doesn't pause when I switch apps",
    "screenshot": null,
    "context": {
      "currentView": "session-execution",
      "exerciseId": "plank",
      "deviceInfo": "iPhone 14, iOS 17.4, Safari"
    },
    "status": "new",
    "response": null
  }
}
```

### Implementation

```javascript
// js/components/feedbackButton.js

const FeedbackButton = {
  
  render() {
    return `
      <button 
        class="feedback-fab" 
        onclick="FeedbackButton.open()"
        aria-label="Give feedback"
      >
        💬
      </button>
    `;
  },
  
  open() {
    const context = this.captureContext();
    
    const modal = document.createElement('div');
    modal.className = 'feedback-modal';
    modal.innerHTML = `
      <div class="feedback-content">
        <header>
          <h2>Send Feedback</h2>
          <button class="close-btn" onclick="FeedbackButton.close()">×</button>
        </header>
        
        <form onsubmit="FeedbackButton.submit(event)">
          <div class="feedback-categories">
            <label class="category-option">
              <input type="radio" name="category" value="bug" />
              <span>🐛 Bug</span>
            </label>
            <label class="category-option">
              <input type="radio" name="category" value="suggestion" />
              <span>💡 Suggestion</span>
            </label>
            <label class="category-option">
              <input type="radio" name="category" value="confused" />
              <span>❓ Confused</span>
            </label>
            <label class="category-option">
              <input type="radio" name="category" value="love" />
              <span>❤️ Love it</span>
            </label>
          </div>
          
          <div class="input-group">
            <label for="feedback-message">What's on your mind?</label>
            <textarea 
              id="feedback-message" 
              rows="4" 
              placeholder="Tell us anything..."
              required
            ></textarea>
          </div>
          
          <input type="hidden" id="feedback-context" value='${JSON.stringify(context)}' />
          
          <button type="submit" class="btn btn-primary btn-full">
            Send Feedback
          </button>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
  },
  
  captureContext() {
    return {
      currentView: App.currentView,
      timestamp: new Date().toISOString(),
      deviceInfo: `${navigator.userAgent}`,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      // Add any relevant state
      sessionInProgress: !!window.currentSession
    };
  },
  
  async submit(event) {
    event.preventDefault();
    
    const category = document.querySelector('input[name="category"]:checked')?.value;
    const message = document.getElementById('feedback-message').value;
    const context = JSON.parse(document.getElementById('feedback-context').value);
    
    const feedback = {
      id: `fb_${Date.now()}`,
      userId: Store.getCurrentUserId(),
      type: 'quick',
      submittedAt: new Date().toISOString(),
      category,
      message,
      context,
      status: 'new'
    };
    
    // Save locally and sync when online
    this.saveFeedback(feedback);
    
    this.close();
    Toast.show('Thank you! Your feedback helps make Alongside better.');
  },
  
  close() {
    document.querySelector('.feedback-modal')?.remove();
  },
  
  saveFeedback(feedback) {
    const allFeedback = JSON.parse(localStorage.getItem('alongside_feedback') || '[]');
    allFeedback.push(feedback);
    localStorage.setItem('alongside_feedback', JSON.stringify(allFeedback));
    
    // In production, sync to server
    // this.syncToServer(feedback);
  }
};

export default FeedbackButton;
```

---

## Fortnightly Beta Survey

### Survey Questions

```javascript
// js/data/betaSurvey.js

const BetaSurveyQuestions = {
  
  version: '1.0',
  frequency: 'fortnightly',
  
  questions: [
    // Usage
    {
      id: 'usage-frequency',
      type: 'single-choice',
      question: 'How often have you used Alongside in the past 2 weeks?',
      required: true,
      options: [
        { value: 'daily', label: 'Almost every day' },
        { value: '3-5', label: '3-5 times per week' },
        { value: '1-2', label: '1-2 times per week' },
        { value: 'less', label: 'Less than once a week' },
        { value: 'none', label: "I haven't used it" }
      ]
    },
    
    // Show only if usage is 'none' or 'less'
    {
      id: 'usage-barrier',
      type: 'multi-choice',
      question: "What's stopped you from using it more?",
      required: false,
      showIf: { 'usage-frequency': ['none', 'less'] },
      options: [
        { value: 'time', label: "Didn't have time" },
        { value: 'forgot', label: 'Forgot about it' },
        { value: 'energy', label: "Didn't have the energy" },
        { value: 'confusing', label: 'Found it confusing' },
        { value: 'boring', label: "Workouts weren't interesting" },
        { value: 'technical', label: 'Technical issues' },
        { value: 'other', label: 'Other' }
      ]
    },
    
    // Best part
    {
      id: 'best-part',
      type: 'text',
      question: 'What do you like most about Alongside so far?',
      required: true,
      placeholder: 'Be specific if you can...',
      minLength: 10
    },
    
    // Frustrations
    {
      id: 'frustrations',
      type: 'text',
      question: "What's frustrating or confusing?",
      required: false,
      placeholder: 'Nothing is too small to mention...'
    },
    
    // Check-in experience
    {
      id: 'checkin-useful',
      type: 'rating',
      question: 'How useful is the daily check-in?',
      required: true,
      scale: {
        min: 1,
        max: 5,
        labels: {
          1: 'Not useful',
          3: 'Somewhat useful',
          5: 'Very useful'
        }
      }
    },
    
    // Coach experience
    {
      id: 'coach-helpful',
      type: 'rating',
      question: 'Does the Coach feel helpful and supportive?',
      required: true,
      scale: {
        min: 1,
        max: 5,
        labels: {
          1: 'Not at all',
          3: 'Somewhat',
          5: 'Very much'
        }
      }
    },
    
    // Workout experience
    {
      id: 'workout-appropriate',
      type: 'rating',
      question: 'Do the workouts feel right for your energy and conditions?',
      required: true,
      scale: {
        min: 1,
        max: 5,
        labels: {
          1: 'Never',
          3: 'Sometimes',
          5: 'Always'
        }
      }
    },
    
    // Feature request
    {
      id: 'feature-request',
      type: 'text',
      question: "What's one feature you wish Alongside had?",
      required: false,
      placeholder: "Don't hold back..."
    },
    
    // NPS
    {
      id: 'nps',
      type: 'nps',
      question: 'How likely are you to recommend Alongside to a friend?',
      required: true,
      scale: {
        min: 0,
        max: 10,
        labels: {
          0: 'Not at all likely',
          10: 'Extremely likely'
        }
      }
    },
    
    // NPS follow-up
    {
      id: 'nps-reason',
      type: 'text',
      question: 'What\'s the main reason for your score?',
      required: false,
      placeholder: 'Help us understand...'
    },
    
    // Testimonial opportunity
    {
      id: 'testimonial-willing',
      type: 'single-choice',
      question: 'Would you be willing to share a testimonial?',
      required: false,
      options: [
        { value: 'yes', label: 'Yes, I\'d be happy to' },
        { value: 'maybe', label: 'Maybe, ask me later' },
        { value: 'no', label: 'No thanks' }
      ]
    },
    
    // Anything else
    {
      id: 'anything-else',
      type: 'text',
      question: 'Anything else you want to tell us?',
      required: false,
      placeholder: 'This is your space...'
    }
  ]
};

export default BetaSurveyQuestions;
```

---

### Survey UI Component

```javascript
// js/views/survey.js

const SurveyView = {
  
  currentQuestion: 0,
  answers: {},
  
  render(surveyData) {
    this.questions = surveyData.questions;
    this.currentQuestion = 0;
    this.answers = {};
    
    return `
      <div class="survey-view">
        <header class="survey-header">
          <h1>Quick Feedback</h1>
          <p class="survey-progress">
            Question <span id="q-current">1</span> of ${this.questions.length}
          </p>
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
          </div>
        </header>
        
        <main class="survey-content" id="survey-content">
          ${this.renderQuestion(this.questions[0])}
        </main>
        
        <footer class="survey-footer">
          <button class="btn btn-text" id="btn-back" onclick="SurveyView.back()" disabled>
            Back
          </button>
          <button class="btn btn-primary" id="btn-next" onclick="SurveyView.next()">
            Next
          </button>
        </footer>
      </div>
    `;
  },
  
  renderQuestion(q) {
    const renderers = {
      'single-choice': this.renderSingleChoice,
      'multi-choice': this.renderMultiChoice,
      'text': this.renderText,
      'rating': this.renderRating,
      'nps': this.renderNPS
    };
    
    return `
      <div class="question" data-id="${q.id}">
        <h2 class="question-text">${q.question}</h2>
        ${q.required ? '' : '<p class="optional-label">Optional</p>'}
        <div class="question-input">
          ${renderers[q.type].call(this, q)}
        </div>
      </div>
    `;
  },
  
  renderSingleChoice(q) {
    return `
      <div class="choice-list">
        ${q.options.map(opt => `
          <label class="choice-option">
            <input 
              type="radio" 
              name="${q.id}" 
              value="${opt.value}"
              onchange="SurveyView.saveAnswer('${q.id}', '${opt.value}')"
            />
            <span>${opt.label}</span>
          </label>
        `).join('')}
      </div>
    `;
  },
  
  renderMultiChoice(q) {
    return `
      <div class="choice-list">
        ${q.options.map(opt => `
          <label class="choice-option">
            <input 
              type="checkbox" 
              name="${q.id}" 
              value="${opt.value}"
              onchange="SurveyView.saveMultiAnswer('${q.id}')"
            />
            <span>${opt.label}</span>
          </label>
        `).join('')}
      </div>
    `;
  },
  
  renderText(q) {
    return `
      <textarea 
        id="input-${q.id}"
        placeholder="${q.placeholder || ''}"
        rows="4"
        onchange="SurveyView.saveAnswer('${q.id}', this.value)"
      ></textarea>
    `;
  },
  
  renderRating(q) {
    const { min, max, labels } = q.scale;
    return `
      <div class="rating-scale">
        <div class="rating-options">
          ${Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => `
            <label class="rating-option">
              <input 
                type="radio" 
                name="${q.id}" 
                value="${n}"
                onchange="SurveyView.saveAnswer('${q.id}', '${n}')"
              />
              <span class="rating-number">${n}</span>
            </label>
          `).join('')}
        </div>
        <div class="rating-labels">
          <span>${labels[min]}</span>
          <span>${labels[max]}</span>
        </div>
      </div>
    `;
  },
  
  renderNPS(q) {
    return `
      <div class="nps-scale">
        <div class="nps-options">
          ${Array.from({ length: 11 }, (_, i) => `
            <label class="nps-option">
              <input 
                type="radio" 
                name="${q.id}" 
                value="${i}"
                onchange="SurveyView.saveAnswer('${q.id}', '${i}')"
              />
              <span>${i}</span>
            </label>
          `).join('')}
        </div>
        <div class="nps-labels">
          <span>Not at all likely</span>
          <span>Extremely likely</span>
        </div>
      </div>
    `;
  },
  
  saveAnswer(questionId, value) {
    this.answers[questionId] = value;
  },
  
  saveMultiAnswer(questionId) {
    const checked = document.querySelectorAll(`input[name="${questionId}"]:checked`);
    this.answers[questionId] = Array.from(checked).map(el => el.value);
  },
  
  next() {
    const currentQ = this.questions[this.currentQuestion];
    
    // Validate required
    if (currentQ.required && !this.answers[currentQ.id]) {
      Toast.show('Please answer this question');
      return;
    }
    
    // Move to next question (skip if showIf not met)
    let nextIndex = this.currentQuestion + 1;
    while (nextIndex < this.questions.length) {
      const nextQ = this.questions[nextIndex];
      if (this.shouldShow(nextQ)) break;
      nextIndex++;
    }
    
    if (nextIndex >= this.questions.length) {
      this.submit();
      return;
    }
    
    this.currentQuestion = nextIndex;
    this.updateUI();
  },
  
  back() {
    if (this.currentQuestion === 0) return;
    
    let prevIndex = this.currentQuestion - 1;
    while (prevIndex >= 0) {
      const prevQ = this.questions[prevIndex];
      if (this.shouldShow(prevQ)) break;
      prevIndex--;
    }
    
    this.currentQuestion = prevIndex;
    this.updateUI();
  },
  
  shouldShow(question) {
    if (!question.showIf) return true;
    
    for (const [qId, allowedValues] of Object.entries(question.showIf)) {
      const answer = this.answers[qId];
      if (!allowedValues.includes(answer)) return false;
    }
    return true;
  },
  
  updateUI() {
    const q = this.questions[this.currentQuestion];
    document.getElementById('survey-content').innerHTML = this.renderQuestion(q);
    document.getElementById('q-current').textContent = this.currentQuestion + 1;
    document.getElementById('progress-fill').style.width = 
      `${((this.currentQuestion + 1) / this.questions.length) * 100}%`;
    document.getElementById('btn-back').disabled = this.currentQuestion === 0;
    
    // Restore previous answer if exists
    if (this.answers[q.id]) {
      this.restoreAnswer(q);
    }
  },
  
  restoreAnswer(q) {
    const answer = this.answers[q.id];
    if (q.type === 'text') {
      document.getElementById(`input-${q.id}`).value = answer;
    } else if (q.type === 'multi-choice') {
      answer.forEach(val => {
        const input = document.querySelector(`input[name="${q.id}"][value="${val}"]`);
        if (input) input.checked = true;
      });
    } else {
      const input = document.querySelector(`input[name="${q.id}"][value="${answer}"]`);
      if (input) input.checked = true;
    }
  },
  
  submit() {
    const submission = {
      id: `survey_${Date.now()}`,
      oderId: Store.getCurrentUserId(),
      surveyVersion: BetaSurveyQuestions.version,
      submittedAt: new Date().toISOString(),
      answers: this.answers
    };
    
    // Save locally
    const surveys = JSON.parse(localStorage.getItem('alongside_surveys') || '[]');
    surveys.push(submission);
    localStorage.setItem('alongside_surveys', JSON.stringify(surveys));
    
    // Show thank you
    document.querySelector('.survey-view').innerHTML = `
      <div class="survey-complete">
        <h1>Thank you! 🙏</h1>
        <p>Your feedback helps make Alongside better for everyone.</p>
        <button class="btn btn-primary" onclick="App.navigate('today')">
          Back to app
        </button>
      </div>
    `;
    
    // Schedule next survey in 2 weeks
    localStorage.setItem('alongside_next_survey', 
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    );
  }
};

export default SurveyView;
```

---

## Session Feedback (Post-Exercise)

Already specified in Doc 1 (Architecture), but here's the complete schema:

```javascript
// Session feedback schema (per exercise)
const exerciseFeedback = {
  exerciseId: 'plank',
  difficulty: 'too-hard', // too-easy | just-right | too-hard | couldnt-complete
  difficultyReason: 'Pain increased during hold', // Free text if too-hard or couldnt-complete
  painBefore: 4,
  painAfter: 6,
  notes: 'Left side worse than right',
  skipped: false,
  skipReason: null
};

// Session feedback schema (overall)
const sessionFeedback = {
  sessionId: 'session_abc123',
  completedAt: '2026-04-20T18:30:00Z',
  overallRating: 4, // 1-5
  energyAfter: 6, // 1-10
  moodAfter: 7, // 1-10
  wouldRepeat: true,
  coachHelpful: true,
  exerciseFeedback: [/* array of per-exercise feedback */],
  comments: 'Good session, hamstring felt better than expected'
};
```

---

## Exit Survey (Cancellation)

```javascript
const ExitSurveyQuestions = {
  
  questions: [
    {
      id: 'cancel-reason',
      type: 'single-choice',
      question: "We're sorry to see you go. What's the main reason?",
      required: true,
      options: [
        { value: 'cost', label: 'Too expensive' },
        { value: 'not-using', label: 'Not using it enough' },
        { value: 'not-helpful', label: "Wasn't helpful for me" },
        { value: 'technical', label: 'Technical issues' },
        { value: 'found-alternative', label: 'Found something else' },
        { value: 'temporary', label: 'Just need a break' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'cancel-detail',
      type: 'text',
      question: 'Could you tell us more?',
      required: false,
      placeholder: 'Any details help us improve...'
    },
    {
      id: 'would-return',
      type: 'single-choice',
      question: 'Would you consider coming back in the future?',
      required: false,
      options: [
        { value: 'yes', label: 'Yes, probably' },
        { value: 'maybe', label: 'Maybe' },
        { value: 'no', label: 'Unlikely' }
      ]
    },
    {
      id: 'what-would-change',
      type: 'text',
      question: 'What would need to change for you to come back?',
      required: false,
      showIf: { 'would-return': ['yes', 'maybe'] }
    }
  ]
};
```

---

# PART 5: FEEDBACK COLLECTION SCHEDULE

## Beta Period Schedule

| Week | Date | Action |
|------|------|--------|
| Week 1 | Apr 14 | Beta launch - enable quick feedback button |
| Week 2 | Apr 21 | Send "How's it going?" email (informal check) |
| Week 2 | Apr 25 | **Survey 1:** First fortnightly survey |
| Week 4 | May 9 | **Survey 2:** Second fortnightly survey |
| Week 4 | May 9 | Request testimonials from high-NPS users |
| Week 6 | May 23 | **Survey 3:** Third fortnightly survey |
| Week 8 | Jun 6 | **Final beta survey** (+ launch prep questions) |

## Survey Distribution

### In-App Prompt

```javascript
// Check if survey is due
function checkSurveyDue() {
  const nextSurvey = localStorage.getItem('alongside_next_survey');
  if (!nextSurvey) return false;
  
  return new Date(nextSurvey) <= new Date();
}

// Show survey prompt (not during session or low mood)
function promptSurveyIfDue(user) {
  if (!checkSurveyDue()) return;
  if (user.todayCheckin?.mood <= 4) return; // Don't ask when struggling
  if (window.sessionInProgress) return;
  
  showSurveyPrompt();
}

function showSurveyPrompt() {
  const prompt = document.createElement('div');
  prompt.className = 'survey-prompt card';
  prompt.innerHTML = `
    <h3>Quick feedback? (2 mins)</h3>
    <p>Your input shapes how Alongside develops.</p>
    <div class="prompt-actions">
      <button class="btn btn-primary" onclick="App.navigate('survey')">
        Sure, let's go
      </button>
      <button class="btn btn-text" onclick="this.closest('.survey-prompt').remove()">
        Maybe later
      </button>
    </div>
  `;
  document.body.appendChild(prompt);
}
```

### Email Reminder (If Not Completed)

Subject: "Quick feedback on Alongside? (2 mins)"

```
Hi [Name],

You've been using Alongside for 2 weeks now - thank you!

We'd love to hear how it's going. Got 2 minutes?

[Take the quick survey →]

Your feedback directly shapes what we build next.

Thanks for being a Founding Member,
Graeme

P.S. If something's broken or frustrating, just reply to this email - I read every one.
```

---

# PART 6: ADMIN DASHBOARD FOR FEEDBACK

## Viewing Collected Feedback

```javascript
// js/views/admin/feedback.js

const AdminFeedbackView = {
  
  render() {
    const feedback = this.getAllFeedback();
    const surveys = this.getAllSurveys();
    
    return `
      <div class="admin-feedback-view">
        <header>
          <h1>Feedback Dashboard</h1>
          <div class="filter-tabs">
            <button class="tab active" data-tab="quick">Quick Feedback (${feedback.length})</button>
            <button class="tab" data-tab="surveys">Surveys (${surveys.length})</button>
            <button class="tab" data-tab="nps">NPS Scores</button>
          </div>
        </header>
        
        <section id="tab-quick" class="tab-content active">
          ${this.renderQuickFeedback(feedback)}
        </section>
        
        <section id="tab-surveys" class="tab-content">
          ${this.renderSurveys(surveys)}
        </section>
        
        <section id="tab-nps" class="tab-content">
          ${this.renderNPSOverview(surveys)}
        </section>
      </div>
    `;
  },
  
  renderQuickFeedback(feedback) {
    const grouped = {
      bug: feedback.filter(f => f.category === 'bug'),
      suggestion: feedback.filter(f => f.category === 'suggestion'),
      confused: feedback.filter(f => f.category === 'confused'),
      love: feedback.filter(f => f.category === 'love')
    };
    
    return `
      <div class="feedback-summary">
        <div class="summary-card bug">🐛 ${grouped.bug.length} bugs</div>
        <div class="summary-card suggestion">💡 ${grouped.suggestion.length} suggestions</div>
        <div class="summary-card confused">❓ ${grouped.confused.length} confused</div>
        <div class="summary-card love">❤️ ${grouped.love.length} love</div>
      </div>
      
      <div class="feedback-list">
        ${feedback.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
          .map(f => `
            <div class="feedback-item card ${f.category}">
              <div class="feedback-header">
                <span class="category">${f.category}</span>
                <span class="date">${this.formatDate(f.submittedAt)}</span>
              </div>
              <p class="message">${f.message}</p>
              <details class="context">
                <summary>Context</summary>
                <pre>${JSON.stringify(f.context, null, 2)}</pre>
              </details>
            </div>
          `).join('')}
      </div>
    `;
  },
  
  renderNPSOverview(surveys) {
    const npsScores = surveys
      .map(s => parseInt(s.answers?.nps))
      .filter(n => !isNaN(n));
    
    if (npsScores.length === 0) {
      return '<p>No NPS data yet</p>';
    }
    
    const promoters = npsScores.filter(n => n >= 9).length;
    const passives = npsScores.filter(n => n >= 7 && n <= 8).length;
    const detractors = npsScores.filter(n => n <= 6).length;
    
    const nps = Math.round(
      ((promoters - detractors) / npsScores.length) * 100
    );
    
    return `
      <div class="nps-overview">
        <div class="nps-score">
          <span class="score">${nps}</span>
          <span class="label">NPS Score</span>
        </div>
        
        <div class="nps-breakdown">
          <div class="segment promoters">
            <span class="count">${promoters}</span>
            <span class="label">Promoters (9-10)</span>
          </div>
          <div class="segment passives">
            <span class="count">${passives}</span>
            <span class="label">Passives (7-8)</span>
          </div>
          <div class="segment detractors">
            <span class="count">${detractors}</span>
            <span class="label">Detractors (0-6)</span>
          </div>
        </div>
        
        <div class="nps-reasons">
          <h3>Why these scores?</h3>
          ${surveys.filter(s => s.answers?.['nps-reason'])
            .map(s => `
              <div class="reason-item">
                <span class="score">${s.answers.nps}</span>
                <p>${s.answers['nps-reason']}</p>
              </div>
            `).join('')}
        </div>
      </div>
    `;
  },
  
  getAllFeedback() {
    return JSON.parse(localStorage.getItem('alongside_feedback') || '[]');
  },
  
  getAllSurveys() {
    return JSON.parse(localStorage.getItem('alongside_surveys') || '[]');
  },
  
  formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export default AdminFeedbackView;
```

---

# QUICK REFERENCE

## Paywall Rules

| Rule | Implementation |
|------|----------------|
| Safety features NEVER gated | Check `NEVER_GATED` array |
| Max 1 prompt per 48 hours | Track `paywall_last_dismissal` |
| Never prompt during low mood | Check `todayCheckin.mood <= 4` |
| Never prompt during recovery mode | Check `user.recoveryMode.active` |

## Friend Code Format

```
ALONGSIDE-[NAME]-[4 CHARS]
Example: ALONGSIDE-GRAEME-7X2K
```

## Founding Member Benefits

| Benefit | Detail |
|---------|--------|
| Trial | 3 months free |
| Annual price | £49/year for life |
| Monthly price | £5.99/month for life |
| Friend codes | 10 initial, +5 when 5 used |

## Feedback Schedule

| Type | Frequency | When |
|------|-----------|------|
| Quick (button) | Anytime | Always available |
| Fortnightly survey | Every 2 weeks | Not during low mood |
| Session feedback | Post-session | After each session |
| NPS | Monthly | Part of survey |

---

**Document created for Project Files. Reference during implementation.**
