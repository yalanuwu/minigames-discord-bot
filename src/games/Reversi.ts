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

export class Reversi implements Game {
  private board: string[][] = [];
  private player1: string;
  private player2: string;
  private currentPlayer: string;
  private finished = false;
  private size = 6;

  constructor(player1: string, player2: string) {
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

  isMultiplayer(): boolean {
    return true;
  }

  async start(): Promise<InteractionReplyOptions> {
    return {
      content: `**Reversi (6x6)**\n<@${this.player1}> (🟣) vs <@${this.player2}> (🟡)\nIt's <@${this.currentPlayer}>'s turn.\n\n${this.renderBoard()}`,
      components: this.buildControls(),
    };
  }

  private initializeBoard() {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill("⬛"));
    this.board[2][2] = "🟡";
    this.board[2][3] = "🟣";
    this.board[3][2] = "🟣";
    this.board[3][3] = "🟡";
  }

  handleMove(interaction: ButtonInteraction): InteractionUpdateOptions | null {
    if (interaction.user.id !== this.currentPlayer)
      return { content: "It's not your turn!", components: this.buildControls() };

    if (this.finished) return null;

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
          components: buildPlayAgainButton("reversi", this.player1, this.player2),
        };
      }
    }

    return {
      content: `**Reversi (6x6)**\n<@${this.player1}> (🟣) vs <@${this.player2}> (🟡)\nIt's <@${this.currentPlayer}>'s turn.\n\n${this.renderBoard()}`,
      components: this.buildControls(),
    };
  }

  isGameOver(): boolean {
    return this.finished;
  }

  private buildControls() {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let i = 0; i < this.size; i += 3) { // 3 buttons per row
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (let c = i; c < i + 3 && c < this.size; c++) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`reversi_col_${c}`)
            .setLabel((c + 1).toString())
            .setStyle(ButtonStyle.Primary)
        );
      }
      rows.push(row);
    }
    return rows;
  }

  private renderBoard(): string {
    return this.board.map(row => row.join("")).join("\n");
  }

  private isValidMove(row: number, col: number, player: string): boolean {
    if (this.board[row][col] !== "⬛") return false;
    const directions = this.getDirections();
    const myPiece = player === this.player1 ? "🟣" : "🟡";
    const oppPiece = player === this.player1 ? "🟡" : "🟣";

    for (let [dr, dc] of directions) {
      let r = row + dr, c = col + dc;
      let foundOpponent = false;
      while (this.inBounds(r, c) && this.board[r][c] === oppPiece) {
        r += dr; c += dc; foundOpponent = true;
      }
      if (foundOpponent && this.inBounds(r, c) && this.board[r][c] === myPiece)
        return true;
    }
    return false;
  }

  private placePiece(row: number, col: number, player: string) {
    const myPiece = player === this.player1 ? "🟣" : "🟡";
    const oppPiece = player === this.player1 ? "🟡" : "🟣";
    this.board[row][col] = myPiece;

    const directions = this.getDirections();
    for (let [dr, dc] of directions) {
      let r = row + dr, c = col + dc;
      const flips: [number, number][] = [];
      while (this.inBounds(r, c) && this.board[r][c] === oppPiece) {
        flips.push([r, c]);
        r += dr;
        c += dc;
      }
      if (flips.length && this.inBounds(r, c) && this.board[r][c] === myPiece) {
        for (let [fr, fc] of flips) this.board[fr][fc] = myPiece;
      }
    }
  }

  private hasValidMove(player: string): boolean {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.isValidMove(r, c, player)) return true;
      }
    }
    return false;
  }

  private countPieces(): [number, number] {
    let purple = 0, yellow = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === "🟣") purple++;
        if (this.board[r][c] === "🟡") yellow++;
      }
    }
    return [purple, yellow];
  }

  private inBounds(r: number, c: number): boolean {
    return r >= 0 && r < this.size && c >= 0 && c < this.size;
  }

  private getDirections(): [number, number][] {
    return [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
  }
}
