/**
 * store.js - Data persistence layer
 * Handles localStorage with simple get/set API
 */

export const store = {
  
  STORAGE_KEY: 'alongside_user',
  
  // In-memory cache of user data
  data: null,
  
  /**
   * Initialise store - load from localStorage
   */
  init() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      this.data = saved ? JSON.parse(saved) : this.getDefaults();
    } catch (e) {
      console.error('Store: Error loading data', e);
      this.data = this.getDefaults();
    }
    console.log('📦 Store initialised');
  },
  
  /**
   * Default data structure for new users
   */
  getDefaults() {
    return {
      // Onboarding state
      onboardingComplete: false,
      onboardingStep: 1,
      
      // Profile - Step 2
      name: '',
      
      // About - Step 3
      age: null,
      gender: null,
      hormonalTracking: false,
      
      // Body & Targets - Step 4
      weight: null,
      weightUnit: 'kg',
      targetWeight: null,
      targetDate: null,
      targetDescription: '',
      
      // Goals - Step 5
      goals: [],
      
      // Conditions - Step 6
      conditions: [],
      
      // Lifestyle - Step 7
      lifestyle: {
        activityLevel: null,
        stressLevel: null,
        sleepQuality: null
      },
      
      // Equipment - Step 8
      equipment: [],
      
      // Metadata
      createdAt: null,
      updatedAt: null
    };
  },
  
  /**
   * Get a value (supports dot notation: 'lifestyle.stressLevel')
   */
  get(path) {
    if (!this.data) this.init();
    if (!path) return this.data;
    
    const keys = path.split('.');
    let value = this.data;
    
    for (const key of keys) {
      if (value === null || value === undefined) return undefined;
      value = value[key];
    }
    
    return value;
  },
  
  /**
   * Set a value (supports dot notation)
   */
  set(path, value) {
    if (!path) return;
    
    const keys = path.split('.');
    let obj = this.data;
    
    // Navigate to parent
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!obj[key]) obj[key] = {};
      obj = obj[key];
    }
    
    // Set the value
    obj[keys[keys.length - 1]] = value;
    this.data.updatedAt = new Date().toISOString();
    
    this.save();
  },
  
  /**
   * Save to localStorage
   */
  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Store: Error saving data', e);
    }
  },
  
  /**
   * Reset all data
   */
  reset() {
    this.data = this.getDefaults();
    this.save();
    console.log('📦 Store reset');
  },
  
  /**
   * Check if onboarding is complete
   */
  isOnboardingComplete() {
    return this.data.onboardingComplete === true;
  },
  
  /**
   * Mark onboarding as complete
   */
  completeOnboarding() {
    this.data.onboardingComplete = true;
    this.data.createdAt = this.data.createdAt || new Date().toISOString();
    this.save();
  }
};
