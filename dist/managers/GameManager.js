"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
class GameManager {
    static createGame(channelId, game) {
        this.games.set(channelId, game);
    }
    static getGame(channelId) {
        return this.games.get(channelId);
    }
    static removeGame(channelId) {
        this.games.delete(channelId);
    }
}
exports.GameManager = GameManager;
GameManager.games = new Map();
