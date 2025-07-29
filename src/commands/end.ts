import { SlashCommandBuilder } from "discord.js";
import { GameManager } from "../managers/GameManager";

export const command = {
  data: new SlashCommandBuilder()
    .setName("end")
    .setDescription("End the current game in this channel"),
  async execute(interaction: any) {
    const game = GameManager.getGame(interaction.channelId);
    if (!game) {
      return interaction.reply({ content: "No active game to end.", ephemeral: true });
    }
    GameManager.removeGame(interaction.channelId);
    return interaction.reply("Game ended.");
  },
};
