export interface Game {
  id: string;
  title: string;
  match_date: string;
  is_premium: boolean;
  is_live?: boolean;
  premium_analysis: string;
}

export interface GameGroup {
  date: string;
  games: Game[];
}
