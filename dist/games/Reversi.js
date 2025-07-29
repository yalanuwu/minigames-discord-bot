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
exports.Reversi = void 0;
const discord_js_1 = require("discord.js");
const PlayAgainButton_1 = require("../utils/PlayAgainButton");
class Reversi {
    constructor(player1, player2) {
        this.board = [];
        this.finished = false;
        this.size = 6;
        this.player1 = player1;
        this.player2 = player2;
        this.currentPlayer = player1;
        this.initializeBoard();
    }
    getName() {
        return "Reversi";
    }
    getDescription() {
        return "Play Reversi (Othello) on a 6x6 board!";
    }
    isMultiplayer() {
        return true;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                content: `**Reversi (6x6)**\n<@${this.player1}> (🟣) vs <@${this.player2}> (🟡)\nIt's <@${this.currentPlayer}>'s turn.\n\n${this.renderBoard()}`,
                components: this.buildControls(),
            };
        });
    }
    initializeBoard() {
        this.board = Array.from({ length: this.size }, () => Array(this.size).fill("⬛"));
        this.board[2][2] = "🟡";
        this.board[2][3] = "🟣";
        this.board[3][2] = "🟣";
        this.board[3][3] = "🟡";
    }
    handleMove(interaction) {
        if (interaction.user.id !== this.currentPlayer)
            return { content: "It's not your turn!", components: this.buildControls() };
        if (this.finished)
            return null;
        const col = parseInt(interaction.customId.replace("reversi_col_", ""));
        let placed = false;
        for (let r = 0; r < this.size; r++) {
            if (this.isValidMove(r, col, this.currentPlayer)) {
                this.placePiece(r, col, this.currentPlayer);
                placed = true;
                break;
            }
        }
        if (!placed) {
            return { content: "Invalid move in this column!", components: this.buildControls() };
        }
        // Switch player
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        // Check for no moves
        if (!this.hasValidMove(this.currentPlayer)) {
            this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
            if (!this.hasValidMove(this.currentPlayer)) {
                this.finished = true;
                const [purple, yellow] = this.countPieces();
                let winner = purple > yellow ? this.player1 : yellow > purple ? this.player2 : null;
                return {
                    content: `**Game Over!**\n🟣: ${purple} | 🟡: ${yellow}\n${winner ? `Winner: <@${winner}>` : "It's a draw!"}`,
                    components: (0, PlayAgainButton_1.buildPlayAgainButton)("reversi", this.player1, this.player2),
                };
            }
        }
        return {
            content: `**Reversi (6x6)**\n<@${this.player1}> (🟣) vs <@${this.player2}> (🟡)\nIt's <@${this.currentPlayer}>'s turn.\n\n${this.renderBoard()}`,
            components: this.buildControls(),
        };
    }
    isGameOver() {
        return this.finished;
    }
    buildControls() {
        const rows = [];
        for (let i = 0; i < this.size; i += 3) { // 3 buttons per row
            const row = new discord_js_1.ActionRowBuilder();
            for (let c = i; c < i + 3 && c < this.size; c++) {
                row.addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`reversi_col_${c}`)
                    .setLabel((c + 1).toString())
                    .setStyle(discord_js_1.ButtonStyle.Primary));
            }
            rows.push(row);
        }
        return rows;
    }
    renderBoard() {
        return this.board.map(row => row.join("")).join("\n");
    }
    isValidMove(row, col, player) {
        if (this.board[row][col] !== "⬛")
            return false;
        const directions = this.getDirections();
        const myPiece = player === this.player1 ? "🟣" : "🟡";
        const oppPiece = player === this.player1 ? "🟡" : "🟣";
        for (let [dr, dc] of directions) {
            let r = row + dr, c = col + dc;
            let foundOpponent = false;
            while (this.inBounds(r, c) && this.board[r][c] === oppPiece) {
                r += dr;
                c += dc;
                foundOpponent = true;
            }
            if (foundOpponent && this.inBounds(r, c) && this.board[r][c] === myPiece)
                return true;
        }
        return false;
    }
    placePiece(row, col, player) {
        const myPiece = player === this.player1 ? "🟣" : "🟡";
        const oppPiece = player === this.player1 ? "🟡" : "🟣";
        this.board[row][col] = myPiece;
        const directions = this.getDirections();
        for (let [dr, dc] of directions) {
            let r = row + dr, c = col + dc;
            const flips = [];
            while (this.inBounds(r, c) && this.board[r][c] === oppPiece) {
                flips.push([r, c]);
                r += dr;
                c += dc;
            }
            if (flips.length && this.inBounds(r, c) && this.board[r][c] === myPiece) {
                for (let [fr, fc] of flips)
                    this.board[fr][fc] = myPiece;
            }
        }
    }
    hasValidMove(player) {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.isValidMove(r, c, player))
                    return true;
            }
        }
        return false;
    }
    countPieces() {
        let purple = 0, yellow = 0;
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === "🟣")
                    purple++;
                if (this.board[r][c] === "🟡")
                    yellow++;
            }
        }
        return [purple, yellow];
    }
    inBounds(r, c) {
        return r >= 0 && r < this.size && c >= 0 && c < this.size;
    }
    getDirections() {
        return [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
    }
}
exports.Reversi = Reversi;
