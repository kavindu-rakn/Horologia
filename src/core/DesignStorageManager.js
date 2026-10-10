// Horologia — Client Persistence & Community Design Storage Manager
// Zero external dependencies, Vercel-ready, supporting LocalStorage, JSON import/export, and URL-encoded sharing.

import { DEMO_COMMUNITY_DESIGNS } from '../utils/constants.js';

export class DesignStorageManager {
  constructor() {
    this.localStorageKey = 'horologia_custom_designs';
    this.userLikesKey = 'horologia_user_likes';
    this.initFromLocalStorage();
  }

  /**
   * Initializes local storage with curated luxury presets if empty.
   */
  initFromLocalStorage() {
    try {
      const saved = localStorage.getItem(this.localStorageKey);
      if (!saved) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(DEMO_COMMUNITY_DESIGNS));
      }
      if (!localStorage.getItem(this.userLikesKey)) {
        localStorage.setItem(this.userLikesKey, JSON.stringify([]));
      }
    } catch (e) {
      console.warn('LocalStorage unavailable or restricted:', e);
    }
  }

  /**
   * Saves a new bespoke timepiece design.
   * @param {Object} designData
   * @returns {Object} Saved design with generated ID and metadata
   */
  async saveDesign(designData) {
    const newDesign = {
      ...designData,
      id: 'horologia-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      likes: 1,
      createdAt: new Date().toISOString(),
      timestamp: 'Just now'
    };

    try {
      const existing = this.getLocalDesigns();
      existing.unshift(newDesign);
      localStorage.setItem(this.localStorageKey, JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to save design to localStorage:', e);
    }

    return newDesign;
  }

  /**
   * Retrieves all community and user-crafted designs.
   * @returns {Array} List of designs
   */
  async fetchCommunityDesigns() {
    return this.getLocalDesigns();
  }

  /**
   * Internal helper to retrieve and parse stored designs.
   */
  getLocalDesigns() {
    try {
      const raw = localStorage.getItem(this.localStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored designs:', e);
    }
    return [...DEMO_COMMUNITY_DESIGNS];
  }

  /**
   * Toggles or increments like count for a design.
   * @param {string} designId
   * @returns {number} Updated likes
   */
  async likeDesign(designId) {
    try {
      const designs = this.getLocalDesigns();
      const userLikes = JSON.parse(localStorage.getItem(this.userLikesKey) || '[]');
      
      const target = designs.find(d => d.id === designId);
      if (!target) return 0;

      const hasLiked = userLikes.includes(designId);
      if (hasLiked) {
        target.likes = Math.max(0, (target.likes || 1) - 1);
        const idx = userLikes.indexOf(designId);
        userLikes.splice(idx, 1);
      } else {
        target.likes = (target.likes || 0) + 1;
        userLikes.push(designId);
      }

      localStorage.setItem(this.localStorageKey, JSON.stringify(designs));
      localStorage.setItem(this.userLikesKey, JSON.stringify(userLikes));
      return target.likes;
    } catch (e) {
      console.error('Failed to update like status:', e);
      return 0;
    }
  }

  /**
   * Encodes a watch configuration into a sharable URL query string.
   * @param {Object} config
   * @returns {string} Sharable URL
   */
  encodeShareableURL(config) {
    try {
      const serialized = encodeURIComponent(btoa(JSON.stringify(config)));
      const url = new URL(window.location.href);
      url.searchParams.set('build', serialized);
      return url.toString();
    } catch (e) {
      console.warn('Failed to encode shareable URL:', e);
      return window.location.href;
    }
  }

  /**
   * Decodes a watch configuration from current URL parameters if present.
   * @returns {Object|null}
   */
  decodeShareableURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const buildParam = params.get('build');
      if (buildParam) {
        return JSON.parse(atob(decodeURIComponent(buildParam)));
      }
    } catch (e) {
      console.warn('Failed to decode shareable URL configuration:', e);
    }
    return null;
  }

  /**
   * Exports design specifications as a downloadable JSON file.
   * @param {Object} design
   */
  exportDesignJSON(design) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(design, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${(design.title || 'horologia-bespoke').toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
