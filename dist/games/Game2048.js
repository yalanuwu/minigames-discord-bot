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
exports.Game2048 = void 0;
const discord_js_1 = require("discord.js");
const PlayAgainButton_1 = require("../utils/PlayAgainButton");
class Game2048 {
    constructor(player) {
        this.board = [];
        this.size = 4;
        this.finished = false;
        this.won = false;
        this.player = player;
        this.initializeBoard();
    }
    getName() {
        return "2048";
    }
    getDescription() {
        return "Slide tiles to combine and reach 2048!";
    }
    isMultiplayer() {
        return false;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                content: `**2048 started for <@${this.player}>!**\n${this.renderBoard()}`,
                components: [this.buildMoveButtons()],
            };
        });
    }
    handleMove(interaction) {
        if (interaction.user.id !== this.player)
            return { content: "This is not your game!", components: [] };
        if (this.finished)
            return null;
        const direction = interaction.customId.replace("2048_", "");
        this.move(direction);
        this.addRandomTile();
        if (this.checkWin()) {
            this.finished = true;
            this.won = true;
        }
        else if (!this.canMove()) {
            this.finished = true;
        }
        if (this.finished) {
            return {
                content: this.won
                    ? `🎉 **You won!**\n\n${this.renderBoard()}`
                    : `❌ **Game over!**\n\n${this.renderBoard()}`,
                components: (0, PlayAgainButton_1.buildPlayAgainButton)("game2048", this.player, this.player),
            };
        }
        return {
            content: `**2048 in progress**\n\n${this.renderBoard()}`,
            components: [...this.buildBoardUI(), this.buildMoveButtons()],
        };
    }
    isGameOver() {
        return this.finished;
    }
    // --- Board logic ---
    initializeBoard() {
        this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));
        this.addRandomTile();
        this.addRandomTile();
    }
    addRandomTile() {
        const emptyCells = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.board[y][x] === 0)
                    emptyCells.push({ x, y });
            }
        }
        if (emptyCells.length === 0)
            return;
        const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.board[y][x] = Math.random() < 0.9 ? 2 : 4;
    }
    move(direction) {
        let moved = false;
        const rotate = (board) => board[0].map((_, i) => board.map(row => row[i]));
        const reverse = (board) => board.map(row => [...row].reverse());
        let workBoard = this.board;
        if (direction === "up") {
            workBoard = rotate(workBoard);
        }
        else if (direction === "down") {
            workBoard = rotate(workBoard).map(row => row.reverse());
        }
        else if (direction === "right") {
            workBoard = reverse(workBoard);
        }
        workBoard = workBoard.map(row => {
            const newRow = row.filter(v => v !== 0);
            for (let i = 0; i < newRow.length - 1; i++) {
                if (newRow[i] === newRow[i + 1]) {
                    newRow[i] *= 2;
                    newRow[i + 1] = 0;
                }
            }
            const merged = newRow.filter(v => v !== 0);
            while (merged.length < this.size)
                merged.push(0);
            return merged;
        });
        if (direction === "up") {
            workBoard = rotate(workBoard).map(row => row.reverse());
        }
        else if (direction === "down") {
            workBoard = rotate(workBoard.reverse());
        }
        else if (direction === "right") {
            workBoard = reverse(workBoard);
        }
        if (JSON.stringify(this.board) !== JSON.stringify(workBoard))
            moved = true;
        this.board = workBoard;
        return moved;
    }
    checkWin() {
        return this.board.some(row => row.some(cell => cell >= 2048));
    }
    canMove() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.board[y][x] === 0)
                    return true;
                if (x < this.size - 1 && this.board[y][x] === this.board[y][x + 1])
                    return true;
                if (y < this.size - 1 && this.board[y][x] === this.board[y + 1][x])
                    return true;
            }
        }
        return false;
    }
    // --- UI ---
    renderBoard() {
        return "```\n" + this.board.map(row => row.map(val => (val === 0 ? "." : val.toString().padEnd(4, " "))).join("")).join("\n") + "\n```";
    }
    buildBoardUI() {
        return []; // Board is rendered as text for now
    }
    buildMoveButtons() {
        return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId("2048_up").setLabel("⬆️").setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId("2048_left").setLabel("⬅️").setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId("2048_down").setLabel("⬇️").setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId("2048_right").setLabel("➡️").setStyle(discord_js_1.ButtonStyle.Primary));
    }
}
exports.Game2048 = Game2048;
