import { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionReplyOptions, InteractionUpdateOptions, ButtonInteraction } from "discord.js";
import { Game } from "./GameInterface";
import { buildPlayAgainButton } from "../utils/PlayAgainButton";

export class RockPaperScissors implements Game {
  private players: string[];
  private choices: Map<string, string>; // store players' choices
  private finished: boolean;

  constructor(player1: string, player2: string) {
    this.players = [player1, player2];
    this.choices = new Map();
    this.finished = false;
  }

  getName() { return "Rock-Paper-Scissors"; }
  getDescription() { return "Quick match of Rock-Paper-Scissors."; }

  isMultiplayer(): boolean {
      return true;
  }

  private buildButtons(): ActionRowBuilder<ButtonBuilder>[] {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("move_rock").setLabel("🪨 Rock").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("move_paper").setLabel("📄 Paper").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("move_scissors").setLabel("✂️ Scissors").setStyle(ButtonStyle.Primary)
    );
    return [row];
  }

  async start(): Promise<InteractionReplyOptions> {
    return {
      content: `Rock-Paper-Scissors: <@${this.players[0]}> vs <@${this.players[1]}>\nBoth players, make your choice!`,
      components: this.buildButtons()
    };
  }

  handleMove(interaction: ButtonInteraction): InteractionUpdateOptions | null {
    if (this.finished) return null;
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
    const p1Choice = this.choices.get(this.players[0])!;
    const p2Choice = this.choices.get(this.players[1])!;
    const winner = this.getWinner(p1Choice, p2Choice);

    return {
        content: winner === "draw"
            ? `Both chose ${p1Choice}. It's a draw!`
            : `<@${winner}> wins! (${p1Choice} vs ${p2Choice})`,
        components: buildPlayAgainButton("rps", this.players[0], this.players[1])
    };
  }

  private getWinner(c1: string, c2: string): string | "draw" {
    if (c1 === c2) return "draw";
    if (
      (c1 === "rock" && c2 === "scissors") ||
      (c1 === "scissors" && c2 === "paper") ||
      (c1 === "paper" && c2 === "rock")
    ) {
      return this.players[0];
    }
    return this.players[1];
  }

  isGameOver(): boolean {
    return this.finished;
  }
}
