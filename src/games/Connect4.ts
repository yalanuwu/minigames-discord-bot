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

export class Connect4 implements Game {
  private player1: string;
  private player2: string;
  private currentPlayer: string;
  private board: string[][];
  private finished = false;
  private rows = 6;
  private cols = 7;

  constructor(player1: string, player2: string) {
    this.player1 = player1;
    this.player2 = player2;
    this.currentPlayer = player1;
    this.board = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill("⚪")
    );
  }

  getName() {
    return "Connect 4";
  }

  getDescription() {
    return "First to connect 4 discs in a row wins!";
  }

  isMultiplayer(): boolean {
    return true;
  }

  async start(): Promise<InteractionReplyOptions> {
    return {
      content: `**Connect 4**\n<@${this.player1}> vs <@${this.player2}>\nIt's <@${this.currentPlayer}>'s turn.\n\n${this.renderBoard()}`,
      components: this.buildBoard(),
    };
  }

  private renderBoard() {
    return this.board.map(row => row.join("")).join("\n");
    }

  handleMove(interaction: ButtonInteraction): InteractionUpdateOptions | null {
    if (interaction.user.id !== this.currentPlayer)
      return { content: "It's not your turn!", components: this.buildBoard() };

    if (this.finished)
      return { content: "The game is over!", components: [] };

    const col = parseInt(interaction.customId.replace("connect4_", ""), 10);
    if (isNaN(col)) return null;

    // Find the lowest empty row in the column
    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.board[row][col] === "⚪") {
        this.board[row][col] =
          this.currentPlayer === this.player1 ? "🔴" : "🟡";

        if (this.checkWin(row, col)) {
          this.finished = true;
          return {
            content: `🎉 **<@${this.currentPlayer}> wins!**`,
            components: buildPlayAgainButton(
              "connect4",
              this.player1,
              this.player2
            ),
          };
        }

        // Check for draw
        if (this.board.every((r) => r.every((c) => c !== "⚪"))) {
          this.finished = true;
          return {
            content: `It's a draw!`,
            components: buildPlayAgainButton(
              "connect4",
              this.player1,
              this.player2
            ),
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

  isGameOver(): boolean {
    return this.finished;
  }

  private buildBoard() {
  const controlsRow1 = new ActionRowBuilder<ButtonBuilder>();
  const controlsRow2 = new ActionRowBuilder<ButtonBuilder>();

  for (let c = 0; c < this.cols; c++) {
    const button = new ButtonBuilder()
      .setCustomId(`connect4_${c}`)
      .setLabel((c + 1).toString()) // column number
      .setStyle(ButtonStyle.Primary);

    if (c < 5) controlsRow1.addComponents(button);
    else controlsRow2.addComponents(button);
  }

  return [controlsRow1, controlsRow2]; // 2 rows: 1–5 and 6–7
}

  private checkWin(row: number, col: number): boolean {
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
      while (
        r >= 0 &&
        r < this.rows &&
        c >= 0 &&
        c < this.cols &&
        this.board[r][c] === disc
      ) {
        count++;
        r += dr;
        c += dc;
      }

      // Check backward
      r = row - dr;
      c = col - dc;
      while (
        r >= 0 &&
        r < this.rows &&
        c >= 0 &&
        c < this.cols &&
        this.board[r][c] === disc
      ) {
        count++;
        r -= dr;
        c -= dc;
      }

      if (count >= 4) return true;
    }

    return false;
  }
}
