import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const VERSES = [
  { id: 'space', name: 'Space Verse', color: '#1a1a2e', multiplier: 1, type: 'space', icon: '🚀' },
  { id: 'dream', name: 'Dream Verse', color: '#e94560', multiplier: 5, type: 'dream', icon: '☁️' },
  { id: 'cyber', name: 'Cyber Verse', color: '#00fff5', multiplier: 25, type: 'cyber', icon: '💻' },
  { id: 'magic', name: 'Magic Verse', color: '#9d4edd', multiplier: 125, type: 'magic', icon: '✨' },
  { id: 'ocean', name: 'Ocean Verse', color: '#0077b6', multiplier: 500, type: 'ocean', icon: '🌊' },
  { id: 'sky', name: 'Sky Verse', color: '#90e0ef', multiplier: 2500, type: 'sky', icon: '⛅' },
  { id: 'underground', name: 'Underground', color: '#5c4d3c', multiplier: 10000, type: 'underground', icon: '⛏️' },
  { id: 'time', name: 'Time Verse', color: '#ffb703', multiplier: 50000, type: 'time', icon: '⏳' },
  { id: 'animal', name: 'Animal Verse', color: '#2a9d8f', multiplier: 250000, type: 'animal', icon: '🦁' },
  { id: 'micro', name: 'Micro Verse', color: '#e76f51', multiplier: 1000000, type: 'micro', icon: '🦠' },
  { id: 'giant', name: 'Giant Verse', color: '#8d99ae', multiplier: 5000000, type: 'giant', icon: '🏔️' },
  { id: 'music', name: 'Music Verse', color: '#ff006e', multiplier: 25000000, type: 'music', icon: '🎵' },
  { id: 'food', name: 'Food Verse', color: '#ffbe0b', multiplier: 100000000, type: 'food', icon: '🍔' },
  { id: 'toy', name: 'Toy Verse', color: '#3a86ff', multiplier: 500000000, type: 'toy', icon: '🧸' },
  { id: 'horror', name: 'Horror Verse', color: '#111111', multiplier: 2500000000, type: 'horror', icon: '👻' },
  { id: 'celestial', name: 'Celestial Verse', color: '#f8f9fa', multiplier: 10000000000, type: 'celestial', icon: '👼' },
  { id: 'demon', name: 'Demon Verse', color: '#d90429', multiplier: 50000000000, type: 'demon', icon: '👿' },
  { id: 'nature', name: 'Nature Verse', color: '#38b000', multiplier: 250000000000, type: 'nature', icon: '🌿' },
  { id: 'science', name: 'Science Verse', color: '#00b4d8', multiplier: 1000000000000, type: 'science', icon: '🔬' },
  { id: 'sports', name: 'Sports Verse', color: '#f4a261', multiplier: 5000000000000, type: 'sports', icon: '⚽' },
];

const GENERATORS_DATA = {
  space: [
    { id: 'asteroid_miner', name: 'Asteroid Miner', baseCost: 10, baseProd: 1 },
    { id: 'orbital_station', name: 'Orbital Station', baseCost: 150, baseProd: 10 },
    { id: 'dyson_sphere', name: 'Dyson Sphere', baseCost: 2500, baseProd: 100 },
  ],
  dream: [
    { id: 'lucid_cloud', name: 'Lucid Cloud', baseCost: 10, baseProd: 1 },
    { id: 'memory_forest', name: 'Memory Forest', baseCost: 150, baseProd: 10 },
    { id: 'imagination_factory', name: 'Imagination Factory', baseCost: 2500, baseProd: 100 },
  ],
  cyber: [
    { id: 'data_miner', name: 'Data Miner', baseCost: 10, baseProd: 1 },
    { id: 'hologram_ad', name: 'Hologram Ad', baseCost: 150, baseProd: 10 },
    { id: 'quantum_server', name: 'Quantum Server', baseCost: 2500, baseProd: 100 },
  ],
  // Fallback generic generators for other verses for brevity
};

const getGeneratorsForVerse = (verseId) => {
  if (GENERATORS_DATA[verseId]) return GENERATORS_DATA[verseId];
  return [
    { id: `${verseId}_gen_1`, name: 'Basic Generator', baseCost: 10, baseProd: 1 },
    { id: `${verseId}_gen_2`, name: 'Advanced Facility', baseCost: 150, baseProd: 10 },
    { id: `${verseId}_gen_3`, name: 'Mega Structure', baseCost: 2500, baseProd: 100 },
  ];
};

const INITIAL_STATE = {
  energy: 0,
  premiumGems: 0, // Premium currency
  prestigePoints: 0,

  currentVerse: 'space',
  unlockedVerses: ['space'],

  generators: {}, // { generatorId: count }

  clickPowerLvl: 1,
  managerUnlocked: false,

  lastSaveTime: Date.now(),
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      getVerseGenerators: () => {
        const { currentVerse, generators } = get();
        const templates = getGeneratorsForVerse(currentVerse);
        return templates.map(t => {
          const count = generators[t.id] || 0;
          const cost = Math.floor(t.baseCost * Math.pow(1.15, count));
          return { ...t, count, cost };
        });
      },

      clickEnergy: () => {
        const state = get();
        const verseInfo = VERSES.find(v => v.id === state.currentVerse);
        const earned = state.clickPowerLvl * verseInfo.multiplier * (1 + state.prestigePoints * 0.1);
        set({ energy: state.energy + earned });
      },

      buyGenerator: (genId, cost) => {
        const state = get();
        if (state.energy >= cost) {
          set({
            energy: state.energy - cost,
            generators: { ...state.generators, [genId]: (state.generators[genId] || 0) + 1 }
          });
        }
      },

      upgradeClick: () => {
        const state = get();
        const cost = Math.floor(50 * Math.pow(1.5, state.clickPowerLvl - 1));
        if (state.energy >= cost) {
          set({
            energy: state.energy - cost,
            clickPowerLvl: state.clickPowerLvl + 1
          });
        }
      },

      unlockManager: () => {
        const state = get();
        if (!state.managerUnlocked && state.premiumGems >= 50) {
          set({ premiumGems: state.premiumGems - 50, managerUnlocked: true });
        }
      },

      travelVerse: (verseId) => {
        const state = get();
        if (state.unlockedVerses.includes(verseId)) {
          set({ currentVerse: verseId });
        } else {
          const vIndex = VERSES.findIndex(v => v.id === verseId);
          const cost = 1000 * Math.pow(10, vIndex);
          if (state.energy >= cost) {
            set({
              energy: state.energy - cost,
              unlockedVerses: [...state.unlockedVerses, verseId],
              currentVerse: verseId
            });
          }
        }
      },

      prestige: () => {
        const state = get();
        const earned = Math.floor(Math.sqrt(state.energy / 1000000));
        if (earned > 0) {
          set({
            ...INITIAL_STATE,
            prestigePoints: state.prestigePoints + earned,
            premiumGems: state.premiumGems + 10, // bonus gems
            unlockedVerses: state.unlockedVerses, // keep unlocked
          });
        }
      },

      tick: (deltaSeconds) => {
        const state = get();
        let earned = 0;
        
        // Calculate production across all verses
        VERSES.forEach(verse => {
          const templates = getGeneratorsForVerse(verse.id);
          let verseProd = 0;
          templates.forEach(t => {
            const count = state.generators[t.id] || 0;
            verseProd += count * t.baseProd;
          });
          earned += verseProd * verse.multiplier;
        });

        const prestigeMult = 1 + (state.prestigePoints * 0.1);
        earned = earned * prestigeMult * deltaSeconds;

        if (earned > 0) {
          set({ energy: state.energy + earned });
        }
      },

      addPremiumGems: (amount) => set(s => ({ premiumGems: s.premiumGems + amount })),
      
      processOffline: () => {
        const state = get();
        const now = Date.now();
        const delta = (now - state.lastSaveTime) / 1000;
        if (delta > 60) {
           get().tick(delta);
           set({ lastSaveTime: now });
           return delta;
        }
        set({ lastSaveTime: now });
        return 0;
      }
    }),
    {
      name: 'eon-mobile-save'
    }
  )
);

export { VERSES, getGeneratorsForVerse };
