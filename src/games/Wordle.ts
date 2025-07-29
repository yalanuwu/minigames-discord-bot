import {
  InteractionReplyOptions,
  InteractionUpdateOptions,
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Game } from "./GameInterface";
import { buildPlayAgainButton } from "../utils/PlayAgainButton";
import { readFileSync } from "fs";
import { join } from "path";

export class Wordle implements Game {
  private static WORD_LIST: string[] = []; // Shared across all instances
  private target: string;
  private guesses: string[] = [];
  private maxAttempts = 6;
  private player: string;
  private finished = false;

  constructor(player: string) {
    this.player = player;

    // Load dictionary only once
    if (Wordle.WORD_LIST.length === 0) {
      const filePath = join(__dirname, "../data/words.txt");
      const words = readFileSync(filePath, "utf-8")
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

  isMultiplayer(): boolean {
    return false;
  }

  async start(): Promise<InteractionReplyOptions> {
    return {
      content: `**Wordle** started for <@${this.player}>!\nYou have ${this.maxAttempts} attempts to guess the 5-letter word.\nClick below to submit a guess.`,
      components: this.buildGuessButton(),
    };
  }

  handleMove(interaction: ButtonInteraction): InteractionUpdateOptions | null {
    if (interaction.user.id !== this.player)
      return { content: "This is not your game!", components: [] };

    if (this.finished) return null;

    return {
      content: `Click the button to submit your guess.`,
      components: this.buildGuessButton(),
    };
  }

  handleGuess(word: string): InteractionUpdateOptions {
    if (this.finished) return { content: "Game is over!", components: [] };

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
        components: buildPlayAgainButton("wordle", this.player, this.player),
      };
    }

    if (this.guesses.length >= this.maxAttempts) {
      this.finished = true;
      return {
        content: `❌ Out of attempts! The word was **${this.target.toUpperCase()}**.\n\n${board}`,
        components: buildPlayAgainButton("wordle", this.player, this.player),
      };
    }

    return {
      content: `**Guess submitted!**\n\n${board}\nAttempts left: ${
        this.maxAttempts - this.guesses.length
      }`,
      components: this.buildGuessButton(),
    };
  }

  isGameOver(): boolean {
    return this.finished;
  }

  private buildGuessButton() {
    return [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("wordle_guess")
          .setLabel("Submit Guess")
          .setStyle(ButtonStyle.Primary)
      ),
    ];
  }

  private renderBoard(): string {
    return this.guesses
      .map((guess) => {
        return guess
          .split("")
          .map((letter, i) => {
            if (letter === this.target[i]) return "🟩";
            else if (this.target.includes(letter)) return "🟨";
            else return "⬜";
          })
          .join("");
      })
      .join("\n");
  }
}
