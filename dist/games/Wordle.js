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
exports.Wordle = void 0;
const discord_js_1 = require("discord.js");
const PlayAgainButton_1 = require("../utils/PlayAgainButton");
const fs_1 = require("fs");
const path_1 = require("path");
class Wordle {
    constructor(player) {
        this.guesses = [];
        this.maxAttempts = 6;
        this.finished = false;
        this.player = player;
        // Load dictionary only once
        if (Wordle.WORD_LIST.length === 0) {
            const filePath = (0, path_1.join)(__dirname, "../data/words.txt");
            const words = (0, fs_1.readFileSync)(filePath, "utf-8")
                .split("\n")
                .map((w) => w.trim().toLowerCase())
                .filter((w) => w.length === 5); // Only 5-letter words
            Wordle.WORD_LIST = words;
        }
        this.target = Wordle.WORD_LIST[Math.floor(Math.random() * Wordle.WORD_LIST.length)];
    }
    getName() {
        return "Wordle";
    }
    getDescription() {
        return "Guess the 5-letter word within 6 attempts.";
    }
    isMultiplayer() {
        return false;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                content: `**Wordle** started for <@${this.player}>!\nYou have ${this.maxAttempts} attempts to guess the 5-letter word.\nClick below to submit a guess.`,
                components: this.buildGuessButton(),
            };
        });
    }
    handleMove(interaction) {
        if (interaction.user.id !== this.player)
            return { content: "This is not your game!", components: [] };
        if (this.finished)
            return null;
        return {
            content: `Click the button to submit your guess.`,
            components: this.buildGuessButton(),
        };
    }
    handleGuess(word) {
        if (this.finished)
            return { content: "Game is over!", components: [] };
        word = word.toLowerCase();
        if (word.length !== 5)
            return { content: "Your guess must be 5 letters.", components: this.buildGuessButton() };
        if (!Wordle.WORD_LIST.includes(word))
            return { content: `\`${word}\` is not in the dictionary! Try another word.`, components: this.buildGuessButton() };
        this.guesses.push(word);
        let board = this.renderBoard();
        if (word === this.target) {
            this.finished = true;
            return {
                content: `🎉 **You guessed it!** The word was **${this.target.toUpperCase()}**.\n\n${board}`,
                components: (0, PlayAgainButton_1.buildPlayAgainButton)("wordle", this.player, this.player),
            };
        }
        if (this.guesses.length >= this.maxAttempts) {
            this.finished = true;
            return {
                content: `❌ Out of attempts! The word was **${this.target.toUpperCase()}**.\n\n${board}`,
                components: (0, PlayAgainButton_1.buildPlayAgainButton)("wordle", this.player, this.player),
            };
        }
        return {
            content: `**Guess submitted!**\n\n${board}\nAttempts left: ${this.maxAttempts - this.guesses.length}`,
            components: this.buildGuessButton(),
        };
    }
    isGameOver() {
        return this.finished;
    }
    buildGuessButton() {
        return [
            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("wordle_guess")
                .setLabel("Submit Guess")
                .setStyle(discord_js_1.ButtonStyle.Primary)),
        ];
    }
    renderBoard() {
        return this.guesses
            .map((guess) => {
            return guess
                .split("")
                .map((letter, i) => {
                if (letter === this.target[i])
                    return "🟩";
                else if (this.target.includes(letter))
                    return "🟨";
                else
                    return "⬜";
            })
                .join("");
        })
            .join("\n");
    }
}
exports.Wordle = Wordle;
Wordle.WORD_LIST = []; // Shared across all instances
