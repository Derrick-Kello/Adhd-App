export interface MatchingCard {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export interface TracingShape {
  name: string;
  path: string; // SVG path string
  points: number[][]; // control/reference points
}
