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
exports.MemoryMatch = void 0;
const discord_js_1 = require("discord.js");
const PlayAgainButton_1 = require("../utils/PlayAgainButton");
class MemoryMatch {
    constructor(player, size = 4) {
        this.selected = [];
        this.emojis = ["🍎", "🍌", "🍇", "🍓", "🍉", "🍒", "🍑", "🥝"];
        this.finished = false;
        this.matchedPairs = 0;
        this.player = player;
        this.size = size;
        this.board = this.generateBoard(size);
        this.revealed = Array.from({ length: size }, () => Array(size).fill(false));
    }
    getName() {
        return "Memory Match";
    }
    getDescription() {
        return "Flip cards and match all pairs!";
    }
    isMultiplayer() {
        return false;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                content: `**Memory Match** started for <@${this.player}>!\nFlip cards to find all matching pairs.`,
                components: this.renderBoard(),
            };
        });
    }
    handleMove(interaction) {
        if (interaction.user.id !== this.player)
            return { content: "This is not your game!", components: [] };
        if (this.finished)
            return null;
        const [_, rStr, cStr] = interaction.customId.split("_");
        const r = parseInt(rStr);
        const c = parseInt(cStr);
        if (this.revealed[r][c] || this.selected.some(([sr, sc]) => sr === r && sc === c))
            return { content: "Invalid move!", components: this.renderBoard() };
        this.selected.push([r, c]);
        if (this.selected.length === 2) {
            const [[r1, c1], [r2, c2]] = this.selected;
            if (this.board[r1][c1] === this.board[r2][c2]) {
                this.revealed[r1][c1] = true;
                this.revealed[r2][c2] = true;
                this.matchedPairs++;
                this.selected = [];
                if (this.matchedPairs === (this.size * this.size) / 2) {
                    this.finished = true;
                    return {
                        content: `🎉 **You matched all pairs!**`,
                        components: (0, PlayAgainButton_1.buildPlayAgainButton)("memory", this.player, this.player),
                    };
                }
            }
            else {
                // Temporarily reveal and then hide
                const currentBoard = this.renderBoard(this.selected);
                setTimeout(() => (this.selected = []), 1000); // Clear after short delay
                return {
                    content: `No match! Try again.`,
                    components: currentBoard,
                };
            }
        }
        return {
            content: `Keep flipping cards!`,
            components: this.renderBoard(this.selected),
        };
    }
    isGameOver() {
        return this.finished;
    }
    generateBoard(size) {
        const pairs = this.emojis.slice(0, (size * size) / 2);
        const all = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
        const board = [];
        for (let r = 0; r < size; r++) {
            board.push(all.slice(r * size, r * size + size));
        }
        return board;
    }
    renderBoard(tempReveals = []) {
        const rows = [];
        for (let r = 0; r < this.size; r++) {
            const row = new discord_js_1.ActionRowBuilder();
            for (let c = 0; c < this.size; c++) {
                let label = "❓";
                if (this.revealed[r][c] || tempReveals.some(([tr, tc]) => tr === r && tc === c))
                    label = this.board[r][c];
                row.addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`memory_${r}_${c}`)
                    .setLabel(label)
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setDisabled(this.finished || this.revealed[r][c]));
            }
            rows.push(row);
        }
        return rows;
    }
}
exports.MemoryMatch = MemoryMatch;
