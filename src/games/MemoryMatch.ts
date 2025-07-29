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

export class MemoryMatch implements Game {
  private player: string;
  private size: number;
  private board: string[][];
  private revealed: boolean[][];
  private selected: [number, number][] = [];
  private emojis = ["🍎", "🍌", "🍇", "🍓", "🍉", "🍒", "🍑", "🥝"];
  private finished = false;
  private matchedPairs = 0;

  constructor(player: string, size = 4) {
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

  isMultiplayer(): boolean {
    return false;
  }

  async start(): Promise<InteractionReplyOptions> {
    return {
      content: `**Memory Match** started for <@${this.player}>!\nFlip cards to find all matching pairs.`,
      components: this.renderBoard(),
    };
  }

  handleMove(interaction: ButtonInteraction): InteractionUpdateOptions | null {
    if (interaction.user.id !== this.player)
      return { content: "This is not your game!", components: [] };

    if (this.finished) return null;

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
            components: buildPlayAgainButton("memory", this.player, this.player),
          };
        }
      } else {
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

  isGameOver(): boolean {
    return this.finished;
  }

  private generateBoard(size: number): string[][] {
    const pairs = this.emojis.slice(0, (size * size) / 2);
    const all = [...pairs, ...pairs].sort(() => Math.random() - 0.5);

    const board: string[][] = [];
    for (let r = 0; r < size; r++) {
      board.push(all.slice(r * size, r * size + size));
    }
    return board;
  }

  private renderBoard(tempReveals: [number, number][] = []): ActionRowBuilder<ButtonBuilder>[] {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];

    for (let r = 0; r < this.size; r++) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (let c = 0; c < this.size; c++) {
        let label = "❓";
        if (this.revealed[r][c] || tempReveals.some(([tr, tc]) => tr === r && tc === c))
          label = this.board[r][c];

        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`memory_${r}_${c}`)
            .setLabel(label)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(this.finished || this.revealed[r][c])
        );
      }
      rows.push(row);
    }

    return rows;
  }
}
