import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function buildPlayAgainButton(gameName: string, player1: string, player2: string) {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`playagain_${gameName}_${player1}_${player2}`)
        .setLabel("🔄 Play Again")
        .setStyle(ButtonStyle.Success)
    )
  ];
}
