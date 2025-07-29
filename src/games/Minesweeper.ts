import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  InteractionReplyOptions,
  InteractionUpdateOptions,
} from "discord.js";
import { Game } from "./GameInterface";
import { buildPlayAgainButton } from "../utils/PlayAgainButton";

export class Minesweeper implements Game {
  private size = 5;
  private bombsCount = 5;
  private grid: string[][] = [];
  private revealed: boolean[][] = [];
  private player: string;
  private finished = false;

  constructor(player: string) {
    this.player = player;
    this.generateGrid();
  }

  getName() {
    return "Minesweeper";
  }

  getDescription() {
    return "Reveal all safe tiles without hitting a bomb!";
  }

  isMultiplayer(): boolean {
    return false;
  }

  async start(): Promise<InteractionReplyOptions> {
    return {
      content: `**Minesweeper** started for <@${this.player}>!\nClick the tiles to reveal them.`,
      components: this.renderBoard(),
    };
  }

  handleMove(interaction: ButtonInteraction): InteractionUpdateOptions | null {
    if (interaction.user.id !== this.player)
      return { content: "This is not your game!", components: [] };

    if (this.finished) return null;

    const [row, col] = interaction.customId.split("_").map(Number);

    if (this.revealed[row][col]) {
      return { content: "That tile is already revealed.", components: this.renderBoard() };
    }

    // Reveal tile
    this.revealed[row][col] = true;

    if (this.grid[row][col] === "B") {
      this.finished = true;
      return {
        content: `💥 **Game Over!** You clicked a bomb.`,
        components: this.revealAll(true),
      };
    }

    // If no surrounding bombs, recursively reveal neighbors
    if (this.grid[row][col] === "0") this.revealEmptyTiles(row, col);

    // Check for win
    if (this.checkWin()) {
      this.finished = true;
      return {
        content: `🎉 **You win!** All safe tiles revealed.`,
        components: buildPlayAgainButton("minesweeper", this.player, this.player),
      };
    }

    return {
      content: `**Keep going!**`,
      components: this.renderBoard(),
    };
  }

  isGameOver(): boolean {
    return this.finished;
  }

  // ---------------------
  // Grid & Logic
  // ---------------------
  private generateGrid() {
    // Initialize
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill("0"));
    this.revealed = Array.from({ length: this.size }, () => Array(this.size).fill(false));

    // Place bombs
    let bombsPlaced = 0;
    while (bombsPlaced < this.bombsCount) {
      const r = Math.floor(Math.random() * this.size);
      const c = Math.floor(Math.random() * this.size);
      if (this.grid[r][c] === "B") continue;
      this.grid[r][c] = "B";
      bombsPlaced++;
    }

    // Calculate numbers
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === "B") continue;
        const count = this.countAdjacentBombs(r, c);
        this.grid[r][c] = count.toString();
      }
    }
  }

  private countAdjacentBombs(row: number, col: number): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
          if (this.grid[nr][nc] === "B") count++;
        }
      }
    }
    return count;
  }

  private revealEmptyTiles(row: number, col: number) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
          if (!this.revealed[nr][nc] && this.grid[nr][nc] !== "B") {
            this.revealed[nr][nc] = true;
            if (this.grid[nr][nc] === "0") this.revealEmptyTiles(nr, nc);
          }
        }
      }
    }
  }

  private checkWin(): boolean {
    let safeTiles = this.size * this.size - this.bombsCount;
    let revealedCount = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.revealed[r][c] && this.grid[r][c] !== "B") revealedCount++;
      }
    }
    return revealedCount === safeTiles;
  }

  private revealAll(showBombs = false) {
    // Reveal everything
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        this.revealed[r][c] = true;
      }
    }
    return buildPlayAgainButton("minesweeper", this.player, this.player);
  }

  // ---------------------
  // UI
  // ---------------------
  private renderBoard() {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];

    for (let r = 0; r < this.size; r++) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (let c = 0; c < this.size; c++) {
        const revealed = this.revealed[r][c];
        let label = "⬜";
        let style = ButtonStyle.Secondary;

        if (revealed) {
          if (this.grid[r][c] === "B") {
            label = "💣";
            style = ButtonStyle.Danger;
          } else if (this.grid[r][c] === "0") {
            label = "⬛";
            style = ButtonStyle.Secondary;
          } else {
            label = this.numberToEmoji(parseInt(this.grid[r][c]));
            style = ButtonStyle.Primary;
          }
        }

        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`${r}_${c}`)
            .setLabel(label)
            .setStyle(style)
            .setDisabled(revealed)
        );
      }
      rows.push(row);
    }

    return rows;
  }

  private numberToEmoji(num: number): string {
    const emojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];
    return emojis[num] || " ";
  }
}
