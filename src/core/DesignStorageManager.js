// Horologia — Client Persistence & Community Design Storage Manager
// Zero external dependencies, Vercel-ready, resilient in-memory fallback, and Unicode-safe URL sharing.

import { DEMO_COMMUNITY_DESIGNS } from '../utils/constants.js';

/**
 * Unicode-safe Base64 encoding
 */
function utf8ToBase64(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
}

/**
 * Unicode-safe Base64 decoding
 */
function base64ToUtf8(str) {
  return decodeURIComponent(
    Array.prototype.map.call(atob(str), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  );
}

export class DesignStorageManager {
  constructor() {
    this.localStorageKey = 'horologia_custom_designs';
    this.userLikesKey = 'horologia_user_likes';
    this.memoryDesigns = [];
    this.memoryLikes = new Set();

    this.initStorage();
  }

  /**
   * Initializes storage with curated luxury presets, populating both in-memory cache and localStorage.
   */
  initStorage() {
    let savedDesigns = null;
    let savedLikes = null;

    try {
      const rawDesigns = localStorage.getItem(this.localStorageKey);
      if (rawDesigns) {
        savedDesigns = JSON.parse(rawDesigns);
      }
      const rawLikes = localStorage.getItem(this.userLikesKey);
      if (rawLikes) {
        savedLikes = JSON.parse(rawLikes);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable or restricted, running in resilient in-memory mode:', e);
    }

    if (Array.isArray(savedDesigns) && savedDesigns.length > 0) {
      this.memoryDesigns = savedDesigns;
    } else {
      this.memoryDesigns = [...DEMO_COMMUNITY_DESIGNS];
      this.persistDesigns();
    }

    if (Array.isArray(savedLikes)) {
      this.memoryLikes = new Set(savedLikes);
    }
  }

  /**
   * Safe persistent sync to localStorage
   */
  persistDesigns() {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.memoryDesigns));
    } catch (e) {
      console.warn('Unable to persist designs to localStorage:', e);
    }
  }

  persistLikes() {
    try {
      localStorage.setItem(this.userLikesKey, JSON.stringify([...this.memoryLikes]));
    } catch (e) {
      console.warn('Unable to persist likes to localStorage:', e);
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

    // Update in-memory cache immediately
    this.memoryDesigns.unshift(newDesign);
    this.persistDesigns();

    return newDesign;
  }

  /**
   * Retrieves all community and user-crafted designs.
   * @returns {Array} List of designs
   */
  async fetchCommunityDesigns() {
    return [...this.memoryDesigns];
  }

  /**
   * Toggles or increments like count for a design.
   * @param {string} designId
   * @returns {number} Updated likes
   */
  async likeDesign(designId) {
    const target = this.memoryDesigns.find(d => d.id === designId);
    if (!target) return 0;

    const hasLiked = this.memoryLikes.has(designId);
    if (hasLiked) {
      target.likes = Math.max(0, (target.likes || 1) - 1);
      this.memoryLikes.delete(designId);
    } else {
      target.likes = (target.likes || 0) + 1;
      this.memoryLikes.add(designId);
    }

    this.persistDesigns();
    this.persistLikes();
    return target.likes;
  }

  /**
   * Encodes a watch configuration into a sharable URL query string.
   * @param {Object} config
   * @returns {string} Sharable URL
   */
  encodeShareableURL(config) {
    try {
      const url = new URL(window.location.href);
      if (config.schemeId) {
        url.searchParams.set('scheme', config.schemeId);
      }
      const serialized = utf8ToBase64(JSON.stringify(config));
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
        return JSON.parse(base64ToUtf8(buildParam));
      }
      const schemeParam = params.get('scheme');
      if (schemeParam) {
        return { schemeId: schemeParam };
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
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(design, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `${(design.title || 'horologia-bespoke').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export design JSON:', e);
    }
  }
}
