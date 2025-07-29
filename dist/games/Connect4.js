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
exports.Connect4 = void 0;
const discord_js_1 = require("discord.js");
const PlayAgainButton_1 = require("../utils/PlayAgainButton");
class Connect4 {
    constructor(player1, player2) {
        this.finished = false;
        this.rows = 6;
        this.cols = 7;
        this.player1 = player1;
        this.player2 = player2;
        this.currentPlayer = player1;
        this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill("⚪"));
    }
    getName() {
        return "Connect 4";
    }
    getDescription() {
        return "First to connect 4 discs in a row wins!";
    }
    isMultiplayer() {
        return true;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                content: `**Connect 4**\n<@${this.player1}> vs <@${this.player2}>\nIt's <@${this.currentPlayer}>'s turn.\n\n${this.renderBoard()}`,
                components: this.buildBoard(),
            };
        });
    }
    renderBoard() {
        return this.board.map(row => row.join("")).join("\n");
    }
    handleMove(interaction) {
        if (interaction.user.id !== this.currentPlayer)
            return { content: "It's not your turn!", components: this.buildBoard() };
        if (this.finished)
            return { content: "The game is over!", components: [] };
        const col = parseInt(interaction.customId.replace("connect4_", ""), 10);
        if (isNaN(col))
            return null;
        // Find the lowest empty row in the column
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === "⚪") {
                this.board[row][col] =
                    this.currentPlayer === this.player1 ? "🔴" : "🟡";
                if (this.checkWin(row, col)) {
                    this.finished = true;
                    return {
                        content: `🎉 **<@${this.currentPlayer}> wins!**`,
                        components: (0, PlayAgainButton_1.buildPlayAgainButton)("connect4", this.player1, this.player2),
                    };
                }
                // Check for draw
                if (this.board.every((r) => r.every((c) => c !== "⚪"))) {
                    this.finished = true;
                    return {
                        content: `It's a draw!`,
                        components: (0, PlayAgainButton_1.buildPlayAgainButton)("connect4", this.player1, this.player2),
                    };
                }
                // Switch turns
                this.currentPlayer =
                    this.currentPlayer === this.player1 ? this.player2 : this.player1;
                return {
                    content: `**Connect 4**\n<@${this.player1}> vs <@${this.player2}>\nIt's <@${this.currentPlayer}>'s turn.\n\n${this.renderBoard()}`,
                    components: this.buildBoard(),
                };
            }
        }
        // Column is full
        return {
            content: `That column is full! <@${this.currentPlayer}>, try another.`,
            components: this.buildBoard(),
        };
    }
    isGameOver() {
        return this.finished;
    }
    buildBoard() {
        const controlsRow1 = new discord_js_1.ActionRowBuilder();
        const controlsRow2 = new discord_js_1.ActionRowBuilder();
        for (let c = 0; c < this.cols; c++) {
            const button = new discord_js_1.ButtonBuilder()
                .setCustomId(`connect4_${c}`)
                .setLabel((c + 1).toString()) // column number
                .setStyle(discord_js_1.ButtonStyle.Primary);
            if (c < 5)
                controlsRow1.addComponents(button);
            else
                controlsRow2.addComponents(button);
        }
        return [controlsRow1, controlsRow2]; // 2 rows: 1–5 and 6–7
    }
    checkWin(row, col) {
        const disc = this.board[row][col];
        const directions = [
            [0, 1], // horizontal
            [1, 0], // vertical
            [1, 1], // diagonal \
            [1, -1], // diagonal /
        ];
        for (const [dr, dc] of directions) {
            let count = 1;
            // Check forward
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 &&
                r < this.rows &&
                c >= 0 &&
                c < this.cols &&
                this.board[r][c] === disc) {
                count++;
                r += dr;
                c += dc;
            }
            // Check backward
            r = row - dr;
            c = col - dc;
            while (r >= 0 &&
                r < this.rows &&
                c >= 0 &&
                c < this.cols &&
                this.board[r][c] === disc) {
                count++;
                r -= dr;
                c -= dc;
            }
            if (count >= 4)
                return true;
        }
        return false;
    }
}
exports.Connect4 = Connect4;
