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
  focusSessions: number;
  totalFocusTime: number;
  currentMood: 'happy' | 'calm' | 'frustrated' | 'excited' | 'tired';
  dailyStreak: number;
  lastPlayDate: string;
  
  // Actions
  setAvatar: (avatar: Avatar) => void;
  addStars: (stars: number) => void;
  addBadge: (badge: string) => void;
  completeGame: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  toggleSound: () => void;
  setOnboarded: () => void;
  updateMovementBreak: () => void;
  addFocusSession: (duration: number) => void;
  setMood: (mood: 'happy' | 'calm' | 'frustrated' | 'excited' | 'tired') => void;
  updateDailyStreak: () => void;
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
  focusSessions: 0,
  totalFocusTime: 0,
  currentMood: 'happy',
  dailyStreak: 0,
  lastPlayDate: '',

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
    get().saveGameData();
  },

  addFocusSession: (duration) => {
    set(state => ({
      focusSessions: state.focusSessions + 1,
      totalFocusTime: state.totalFocusTime + duration
    }));
    get().saveGameData();
  },

  setMood: (mood) => {
    set({ currentMood: mood });
    get().saveGameData();
  },

  updateDailyStreak: () => {
    const today = new Date().toDateString();
    const state = get();
    
    if (state.lastPlayDate !== today) {
      set(state => ({
        dailyStreak: state.lastPlayDate === '' ? 1 : state.dailyStreak + 1,
        lastPlayDate: today
      }));
      get().saveGameData();
    }
  },

  saveGameData: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem('gameData', JSON.stringify({
        avatar: state.avatar,
        stats: state.stats,
        isOnboarded: state.isOnboarded,
        difficulty: state.difficulty,
        soundEnabled: state.soundEnabled,
        focusSessions: state.focusSessions,
        totalFocusTime: state.totalFocusTime,
        currentMood: state.currentMood,
        dailyStreak: state.dailyStreak,
        lastPlayDate: state.lastPlayDate
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