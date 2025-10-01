import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar, GameStats, Difficulty } from '../../types/game';

interface GameStore {
  avatar: Avatar;
  stats: GameStats;
  isOnboarded: boolean;
  difficulty: Difficulty;
  soundEnabled: boolean;
  lastMovementBreak: number;
  
  // Actions
  setAvatar: (avatar: Avatar) => void;
  addStars: (stars: number) => void;
  addBadge: (badge: string) => void;
  completeGame: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  toggleSound: () => void;
  setOnboarded: () => void;
  updateMovementBreak: () => void;
  saveGameData: () => void;
  loadGameData: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  avatar: {
    hair: 'brown',
    clothes: 'blue',
    color: 'light',
    accessories: []
  },
  stats: {
    gamesPlayed: 0,
    totalStars: 0,
    badges: [],
    currentLevel: 1,
    streakDays: 0
  },
  isOnboarded: false,
  difficulty: 'easy',
  soundEnabled: true,
  lastMovementBreak: 0,

  setAvatar: (avatar) => {
    set({ avatar });
    get().saveGameData();
  },

  addStars: (stars) => {
    set(state => ({
      stats: {
        ...state.stats,
        totalStars: state.stats.totalStars + stars
      }
    }));
    get().saveGameData();
  },

  addBadge: (badge) => {
    set(state => ({
      stats: {
        ...state.stats,
        badges: [...state.stats.badges, badge]
      }
    }));
    get().saveGameData();
  },

  completeGame: () => {
    set(state => ({
      stats: {
        ...state.stats,
        gamesPlayed: state.stats.gamesPlayed + 1,
        currentLevel: Math.floor(state.stats.gamesPlayed / 5) + 1
      }
    }));
    get().saveGameData();
  },

  setDifficulty: (difficulty) => {
    set({ difficulty });
    get().saveGameData();
  },

  toggleSound: () => {
    set(state => ({ soundEnabled: !state.soundEnabled }));
    get().saveGameData();
  },

  setOnboarded: () => {
    set({ isOnboarded: true });
    get().saveGameData();
  },

  updateMovementBreak: () => {
    set({ lastMovementBreak: Date.now() });
  },

  saveGameData: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem('gameData', JSON.stringify({
        avatar: state.avatar,
        stats: state.stats,
        isOnboarded: state.isOnboarded,
        difficulty: state.difficulty,
        soundEnabled: state.soundEnabled
      }));
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  },

  loadGameData: async () => {
    try {
      const data = await AsyncStorage.getItem('gameData');
      if (data) {
        const parsed = JSON.parse(data);
        set(parsed);
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  }
}));