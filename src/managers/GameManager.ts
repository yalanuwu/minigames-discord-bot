import { Game } from "../games/GameInterface";

export class GameManager {
  private static games: Map<string, Game> = new Map();

  static createGame(channelId: string, game: Game) {
    this.games.set(channelId, game);
  }

  static getGame(channelId: string): Game | undefined {
    return this.games.get(channelId);
  }

  static removeGame(channelId: string) {
    this.games.delete(channelId);
  }
}
