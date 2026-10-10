// Horologia — Decoupled Reactive State Store

export class Store {
  constructor(initialState = {}) {
    this.state = {
      currentChapter: 0,
      activeModal: null,
      isMuted: false,
      explodeProgress: 0,
      hoveredPartId: null,
      ...initialState
    };
    this.listeners = new Map();
  }

  /**
   * Get a snapshot of current state or specific property
   */
  getState(key) {
    return key ? this.state[key] : { ...this.state };
  }

  /**
   * Update state and notify subscribers of changed keys
   */
  setState(updates) {
    const changedKeys = [];
    for (const [key, value] of Object.entries(updates)) {
      if (this.state[key] !== value) {
        this.state[key] = value;
        changedKeys.push(key);
      }
    }

    changedKeys.forEach(key => {
      const callbacks = this.listeners.get(key) || [];
      callbacks.forEach(cb => cb(this.state[key], this.state));
    });

    // Notify wildcard subscribers
    const wildcard = this.listeners.get('*') || [];
    wildcard.forEach(cb => cb(this.state, changedKeys));
  }

  /**
   * Subscribe to specific state key change or '*' for all changes
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);

    // Return unsubscribe function
    return () => {
      const list = this.listeners.get(key);
      if (list) {
        const index = list.indexOf(callback);
        if (index > -1) list.splice(index, 1);
      }
    };
  }
}

export const appStore = new Store();
