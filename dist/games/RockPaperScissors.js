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
exports.RockPaperScissors = void 0;
const discord_js_1 = require("discord.js");
const PlayAgainButton_1 = require("../utils/PlayAgainButton");
class RockPaperScissors {
    constructor(player1, player2) {
        this.players = [player1, player2];
        this.choices = new Map();
        this.finished = false;
    }
    getName() { return "Rock-Paper-Scissors"; }
    getDescription() { return "Quick match of Rock-Paper-Scissors."; }
    isMultiplayer() {
        return true;
    }
    buildButtons() {
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId("move_rock").setLabel("🪨 Rock").setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId("move_paper").setLabel("📄 Paper").setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId("move_scissors").setLabel("✂️ Scissors").setStyle(discord_js_1.ButtonStyle.Primary));
        return [row];
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                content: `Rock-Paper-Scissors: <@${this.players[0]}> vs <@${this.players[1]}>\nBoth players, make your choice!`,
                components: this.buildButtons()
            };
        });
    }
    handleMove(interaction) {
        if (this.finished)
            return null;
        if (!this.players.includes(interaction.user.id)) {
            interaction.reply({ content: "You are not part of this game!", ephemeral: true });
            return null;
        }
        if (this.choices.has(interaction.user.id)) {
            interaction.reply({ content: "You already chose!", ephemeral: true });
            return null;
        }
        const choice = interaction.customId.split("_")[1];
        this.choices.set(interaction.user.id, choice);
        if (this.choices.size < 2) {
            return {
                content: `Waiting for the other player to choose...`,
                components: this.buildButtons()
            };
        }
        // Both players chose → decide winner
        this.finished = true;
        const p1Choice = this.choices.get(this.players[0]);
        const p2Choice = this.choices.get(this.players[1]);
        const winner = this.getWinner(p1Choice, p2Choice);
        return {
            content: winner === "draw"
                ? `Both chose ${p1Choice}. It's a draw!`
                : `<@${winner}> wins! (${p1Choice} vs ${p2Choice})`,
            components: (0, PlayAgainButton_1.buildPlayAgainButton)("rps", this.players[0], this.players[1])
        };
    }
    getWinner(c1, c2) {
        if (c1 === c2)
            return "draw";
        if ((c1 === "rock" && c2 === "scissors") ||
            (c1 === "scissors" && c2 === "paper") ||
            (c1 === "paper" && c2 === "rock")) {
            return this.players[0];
        }
        return this.players[1];
    }
    isGameOver() {
        return this.finished;
    }
}
exports.RockPaperScissors = RockPaperScissors;
