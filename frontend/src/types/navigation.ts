// Block Blast - Navigation Types

/** Available screens in the app */
export type Screen =
  | "menu"
  | "game"
  | "stats"
  | "leaderboard"
  | "dailyChallenge"
  | "settings"
  | "howToPlay";

/** Navigation state */
export interface NavigationState {
  currentScreen: Screen;
}
