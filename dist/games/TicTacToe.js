"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicTacToe = void 0;
const discord_js_1 = require("discord.js");
const PlayAgainButton_1 = require("../utils/PlayAgainButton");
class TicTacToe {
    constructor(player1, player2) {
        this.board = Array(9).fill(" ");
        this.players = [player1, player2];
        this.currentTurn = 0;
        this.winner = null;
    }
    getName() {
        return "Tic-Tac-Toe";
    }
    getDescription() {
        return "Classic 2-player Tic-Tac-Toe";
    }
    buildButtons() {
        const rows = [];
        for (let i = 0; i < 3; i++) {
            const row = new discord_js_1.ActionRowBuilder();
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                const symbol = this.board[index] === " "
                    ? "⬜"
                    : this.board[index] === "X"
                        ? "❌"
                        : "⭕";
                row.addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`move_${index}`)
                    .setLabel(symbol)
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setDisabled(this.board[index] !== " " || this.winner !== null));
            }
            rows.push(row);
        }
        return rows;
    }
    isMultiplayer() {
        return true;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                content: `Tic-Tac-Toe: <@${this.players[0]}> (X) vs <@${this.players[1]}> (O)\n<@${this.players[this.currentTurn]}> goes first.`,
                components: this.buildButtons(),
            };
        });
    }
    handleMove(interaction) {
        const index = parseInt(interaction.customId.split("_")[1]);
        if (this.board[index] !== " " || this.winner)
            return null;
        if (interaction.user.id !== this.players[this.currentTurn]) {
            interaction.reply({
                content: "It's not your turn!",
                ephemeral: true,
            });
            return null;
        }
        this.board[index] = this.currentTurn === 0 ? "X" : "O";
        if (this.checkWin()) {
            this.winner = this.players[this.currentTurn];
        }
        else if (!this.board.includes(" ")) {
            this.winner = "draw";
        }
        else {
            this.currentTurn = 1 - this.currentTurn;
        }
        return {
            content: this.winner
                ? this.winner === "draw"
                    ? "It's a draw!"
                    : `Game Over! <@${this.winner}> wins!`
                : `Tic-Tac-Toe ongoing. <@${this.players[this.currentTurn]}>'s turn.`,
            components: this.winner !== null
                ? (0, PlayAgainButton_1.buildPlayAgainButton)("tictactoe", this.players[0], this.players[1])
                : this.buildButtons(),
        };
    }
    checkWin() {
        const combos = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        return combos.some((c) => this.board[c[0]] !== " " &&
            this.board[c[0]] === this.board[c[1]] &&
            this.board[c[1]] === this.board[c[2]]);
    }
    isGameOver() {
        return this.winner !== null;
    }
}
exports.TicTacToe = TicTacToe;
