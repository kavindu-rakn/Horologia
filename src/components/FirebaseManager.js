// Horologia - Firebase Firestore & LocalStorage Persistent Customizer Manager
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, increment, query, orderBy, limit } from 'firebase/firestore';
import { DEMO_COMMUNITY_DESIGNS } from '../utils/constants.js';

export class FirebaseManager {
  constructor() {
    this.app = null;
    this.db = null;
    this.isConnected = false;
    this.localStorageKey = 'horologia_custom_designs';

    this.initFromLocalStorage();
  }

  // Initialize Firebase with custom config or fallback
  connect(config) {
    try {
      if (!config || !config.apiKey) return false;
      this.app = initializeApp(config);
      this.db = getFirestore(this.app);
      this.isConnected = true;
      console.log('⚡ Firebase connected successfully!');
      return true;
    } catch (err) {
      console.warn('Firebase connection failed, operating in Local Storage mode:', err);
      this.isConnected = false;
      return false;
    }
  }

  initFromLocalStorage() {
    const saved = localStorage.getItem(this.localStorageKey);
    if (!saved) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(DEMO_COMMUNITY_DESIGNS));
    }
  }

  async saveDesign(designData) {
    const newDesign = {
      ...designData,
      id: 'design-' + Date.now(),
      likes: 1,
      createdAt: new Date().toISOString(),
      timestamp: 'Just now'
    };

    if (this.isConnected && this.db) {
      try {
        const docRef = await addDoc(collection(this.db, 'watch_designs'), newDesign);
        newDesign.id = docRef.id;
        return newDesign;
      } catch (e) {
        console.warn('Firestore save failed, saving locally:', e);
      }
    }

    // LocalStorage Fallback
    const localData = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
    localData.unshift(newDesign);
    localStorage.setItem(this.localStorageKey, JSON.stringify(localData));
    return newDesign;
  }

  async fetchCommunityDesigns() {
    if (this.isConnected && this.db) {
      try {
        const q = query(collection(this.db, 'watch_designs'), orderBy('likes', 'desc'), limit(20));
        const querySnapshot = await getDocs(q);
        const designs = [];
        querySnapshot.forEach((doc) => {
          designs.push({ id: doc.id, ...doc.data() });
        });
        if (designs.length > 0) return designs;
      } catch (e) {
        console.warn('Firestore fetch failed, returning local storage items:', e);
      }
    }

    // Fallback to LocalStorage
    return JSON.parse(localStorage.getItem(this.localStorageKey) || JSON.stringify(DEMO_COMMUNITY_DESIGNS));
  }

  async likeDesign(designId) {
    if (this.isConnected && this.db) {
      try {
        const designRef = doc(this.db, 'watch_designs', designId);
        await updateDoc(designRef, { likes: increment(1) });
      } catch (e) {
        console.warn('Firestore like update failed:', e);
      }
    }

    // LocalStorage fallback update
    const localData = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
    const target = localData.find(item => item.id === designId);
    if (target) {
      target.likes += 1;
      localStorage.setItem(this.localStorageKey, JSON.stringify(localData));
    }
  }
}
