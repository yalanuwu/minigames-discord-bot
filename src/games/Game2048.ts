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

export class Game2048 implements Game {
  private player: string;
  private board: number[][] = [];
  private size = 4;
  private finished = false;
  private won = false;

  constructor(player: string) {
    this.player = player;
    this.initializeBoard();
  }

  getName() {
    return "2048";
  }

  getDescription() {
    return "Slide tiles to combine and reach 2048!";
  }

  isMultiplayer(): boolean {
    return false;
  }

  async start(): Promise<InteractionReplyOptions> {
    return {
        content: `**2048 started for <@${this.player}>!**\n${this.renderBoard()}`,
        components: [this.buildMoveButtons()],
    };
  }

  handleMove(interaction: ButtonInteraction): InteractionUpdateOptions | null {
    if (interaction.user.id !== this.player)
      return { content: "This is not your game!", components: [] };

    if (this.finished) return null;

    const direction = interaction.customId.replace("2048_", "") as "up" | "down" | "left" | "right";
    this.move(direction);
    this.addRandomTile();

    if (this.checkWin()) {
      this.finished = true;
      this.won = true;
    } else if (!this.canMove()) {
      this.finished = true;
    }

    if (this.finished) {
      return {
        content: this.won
          ? `🎉 **You won!**\n\n${this.renderBoard()}`
          : `❌ **Game over!**\n\n${this.renderBoard()}`,
        components: buildPlayAgainButton("game2048", this.player, this.player),
      };
    }

    return {
      content: `**2048 in progress**\n\n${this.renderBoard()}`,
      components: [...this.buildBoardUI(), this.buildMoveButtons()],
    };
  }

  isGameOver(): boolean {
    return this.finished;
  }

  // --- Board logic ---
  private initializeBoard() {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.addRandomTile();
    this.addRandomTile();
  }

  private addRandomTile() {
    const emptyCells: { x: number; y: number }[] = [];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.board[y][x] === 0) emptyCells.push({ x, y });
      }
    }
    if (emptyCells.length === 0) return;
    const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.board[y][x] = Math.random() < 0.9 ? 2 : 4;
  }

  private move(direction: "up" | "down" | "left" | "right") {
    let moved = false;
    const rotate = (board: number[][]) => board[0].map((_, i) => board.map(row => row[i]));
    const reverse = (board: number[][]) => board.map(row => [...row].reverse());

    let workBoard = this.board;
    if (direction === "up") {
      workBoard = rotate(workBoard);
    } else if (direction === "down") {
      workBoard = rotate(workBoard).map(row => row.reverse());
    } else if (direction === "right") {
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
      while (merged.length < this.size) merged.push(0);
      return merged;
    });

    if (direction === "up") {
      workBoard = rotate(workBoard).map(row => row.reverse());
    } else if (direction === "down") {
      workBoard = rotate(workBoard.reverse());
    } else if (direction === "right") {
      workBoard = reverse(workBoard);
    }

    if (JSON.stringify(this.board) !== JSON.stringify(workBoard)) moved = true;
    this.board = workBoard;
    return moved;
  }

  private checkWin() {
    return this.board.some(row => row.some(cell => cell >= 2048));
  }

  private canMove() {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.board[y][x] === 0) return true;
        if (x < this.size - 1 && this.board[y][x] === this.board[y][x + 1]) return true;
        if (y < this.size - 1 && this.board[y][x] === this.board[y + 1][x]) return true;
      }
    }
    return false;
  }

  // --- UI ---
    private renderBoard(): string {
        return "```\n" + this.board.map(row =>
            row.map(val => (val === 0 ? "." : val.toString().padEnd(4, " "))).join("")
            ).join("\n") + "\n```";
    }

  private buildBoardUI() {
    return []; // Board is rendered as text for now
  }

  private buildMoveButtons() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("2048_up").setLabel("⬆️").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("2048_left").setLabel("⬅️").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("2048_down").setLabel("⬇️").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("2048_right").setLabel("➡️").setStyle(ButtonStyle.Primary)
    );
  }
}
