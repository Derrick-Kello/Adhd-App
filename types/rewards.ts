export interface Accessory {
  name: string;
  emoji: string;
  cost: number;
  type: 'glasses' | 'hat' | 'cape' | 'crown' | 'hair' | 'wings' | string;
}

export interface Badge {
  name: string;
  emoji: string;
  description: string;
}
