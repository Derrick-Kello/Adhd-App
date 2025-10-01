export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Avatar {
  hair: string;
  clothes: string;
  color: string;
  accessories: string[];
}

export interface GameStats {
  gamesPlayed: number;
  totalStars: number;
  badges: string[];
  currentLevel: number;
  streakDays: number;
}

export interface GameData {
  avatar: Avatar;
  stats: GameStats;
  isOnboarded: boolean;
  difficulty: Difficulty;
  soundEnabled: boolean;
}
