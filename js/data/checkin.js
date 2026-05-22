/**
 * checkin.js - Check-in data management
 *
 * 22 May 2026 v1 — getTodayKey() and getHistory() now use local date
 *                   instead of UTC. Fixes early-morning check-in skip
 *                   for users in UTC+N timezones (e.g. BST = UTC+1).
 * Handles check-in history, patterns, and burnout detection
 */

import { store } from '../store.js';

export const checkinData = {
  
  /**
   * Get today's date as YYYY-MM-DD string
   */
  getTodayKey() {
    // Use local date, not UTC — avoids wrong date for users in UTC+N timezones
    // when the app is used in the early hours before midnight UTC.
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, "0");
    const dd   = String(d.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
  },
  
  /**
   * Check if user has completed check-in today
   */
  hasCheckedInToday() {
    const history = store.get('checkinHistory') || {};
    return !!history[this.getTodayKey()];
  },
  
  /**
   * Get today's check-in data (if exists)
   */
  getTodaysCheckin() {
    const history = store.get('checkinHistory') || {};
    return history[this.getTodayKey()] || null;
  },
  
  /**
   * Save today's check-in
   */
  saveCheckin(data) {
    const history = store.get('checkinHistory') || {};
    const today = this.getTodayKey();
    
    history[today] = {
      ...data,
      timestamp: new Date().toISOString()
    };
    
    // Keep only last 30 days
    const keys = Object.keys(history).sort().reverse();
    if (keys.length > 30) {
      keys.slice(30).forEach(key => delete history[key]);
    }
    
    store.set('checkinHistory', history);
    return history[today];
  },
  
  /**
   * Get check-in history for last N days
   */
  getHistory(days = 7) {
    const history = store.get('checkinHistory') || {};
    const result = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const yyyy = date.getFullYear();
      const mm   = String(date.getMonth() + 1).padStart(2, "0");
      const dd   = String(date.getDate()).padStart(2, "0");
      const key  = yyyy + "-" + mm + "-" + dd;
      
      if (history[key]) {
        result.push({ date: key, ...history[key] });
      }
    }
    
    return result;
  },
  
  /**
   * Analyze patterns for burnout detection
   * Returns: { level: 'none'|'low'|'moderate'|'high', reasons: [] }
   */
  detectBurnout() {
    const history = this.getHistory(7);
    
    if (history.length < 3) {
      return { level: 'none', reasons: [], message: null };
    }
    
    const reasons = [];
    let score = 0;
    
    // Check for low energy streak (3+ days below 4)
    const lowEnergyDays = history.filter(d => d.energy <= 4).length;
    if (lowEnergyDays >= 3) {
      reasons.push('Low energy for several days');
      score += 2;
    }
    
    // Check for declining energy trend
    if (history.length >= 3) {
      const recent = history.slice(0, 3).map(d => d.energy);
      if (recent[0] < recent[1] && recent[1] < recent[2]) {
        reasons.push('Energy has been declining');
        score += 1;
      }
    }
    
    // Check for poor mood streak
    const lowMoodDays = history.filter(d => d.mood <= 4).length;
    if (lowMoodDays >= 3) {
      reasons.push('Mood has been low');
      score += 2;
    }
    
    // Check for poor sleep
    const poorSleepDays = history.filter(d => d.sleepQuality === 'poor').length;
    if (poorSleepDays >= 3) {
      reasons.push('Sleep has been poor');
      score += 2;
    }
    
    // Check for pain flare-up
    const painDays = history.filter(d => {
      if (!d.conditionLevels) return false;
      return Object.values(d.conditionLevels).some(level => level >= 7);
    }).length;
    if (painDays >= 2) {
      reasons.push('Pain levels have been high');
      score += 2;
    }
    
    // Determine level
    let level = 'none';
    let message = null;
    
    if (score >= 5) {
      level = 'high';
      message = "I've noticed you've been struggling. Let's focus on gentle recovery today.";
    } else if (score >= 3) {
      level = 'moderate';
      message = "You've had a tough few days. I'll suggest easier options today.";
    } else if (score >= 1) {
      level = 'low';
      message = "I'm keeping an eye on how you're doing. Take it easy if you need to.";
    }
    
    return { level, reasons, message };
  },
  
  /**
   * Get energy emoji based on level
   */
  getEnergyEmoji(level) {
    const emojis = {
      1: '😴', 2: '🥱', 3: '😔', 4: '😐',
      5: '🙂', 6: '😊', 7: '😀', 8: '😄',
      9: '🤩', 10: '🔥'
    };
    return emojis[level] || '😐';
  },
  
  /**
   * Get energy label based on level
   */
  getEnergyLabel(level) {
    if (level <= 2) return 'Exhausted';
    if (level <= 4) return 'Low';
    if (level <= 6) return 'Okay';
    if (level <= 8) return 'Good';
    return 'Energised';
  },
  
  /**
   * Get mood emoji based on level
   */
  getMoodEmoji(level) {
    const emojis = {
      1: '😢', 2: '😞', 3: '😟', 4: '😕',
      5: '😐', 6: '🙂', 7: '😊', 8: '😄',
      9: '😁', 10: '🥰'
    };
    return emojis[level] || '😐';
  },
  
  /**
   * Get mood label based on level
   */
  getMoodLabel(level) {
    if (level <= 2) return 'Struggling';
    if (level <= 4) return 'Low';
    if (level <= 6) return 'Okay';
    if (level <= 8) return 'Good';
    return 'Great';
  },
  
  /**
   * Get workout intensity suggestion based on check-in
   */
  getSuggestedIntensity(checkin) {
    const { energy, mood, sleepQuality } = checkin;
    const burnout = this.detectBurnout();
    
    // Base score from energy (0-10 scale)
    let score = energy;
    
    // Adjust for mood
    if (mood <= 3) score -= 2;
    else if (mood <= 5) score -= 1;
    else if (mood >= 8) score += 1;
    
    // Adjust for sleep
    if (sleepQuality === 'poor') score -= 2;
    else if (sleepQuality === 'okay') score -= 1;
    
    // Adjust for burnout
    if (burnout.level === 'high') score -= 3;
    else if (burnout.level === 'moderate') score -= 2;
    else if (burnout.level === 'low') score -= 1;
    
    // Clamp to 1-10
    score = Math.max(1, Math.min(10, score));
    
    // Return intensity category
    if (score <= 3) return 'recovery';
    if (score <= 5) return 'gentle';
    if (score <= 7) return 'moderate';
    return 'challenging';
  }
};
