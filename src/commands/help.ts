import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from "discord.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows information and rules for all available games."),
  async execute(interaction: ChatInputCommandInteraction) {
    // Pages
    const pages = [
      new EmbedBuilder()
        .setTitle("🎮 MiniGames Bot - Help")
        .setDescription("Welcome! Use `/play [game]` to start.\n\n**Categories:**\n➡️ Single-player games\n➡️ Multiplayer games\n\nUse the buttons below to switch pages.")
        .setColor("#5865F2")
        .addFields(
          { name: "📜 Commands", value: "`/play [game]` - Start a game\n`/help` - Show this menu\n`/end` - To end an ongoing game" },
          { name: "ℹ️ Note", value: "Some games require an opponent. If you don’t pick one, the bot will warn you." }
        )
        .setFooter({ text: "Page 1/3" }),

      new EmbedBuilder()
        .setTitle("🎮 Single-Player Games")
        .setColor("#43B581")
        .setDescription("Games you can play alone:")
        .addFields(
          { name: "🟩 Wordle", value: "Guess the hidden 5-letter word in 6 tries." },
          { name: "💣 Minesweeper", value: "Clear the grid without hitting a mine." },
          { name: "🧠 Memory Match", value: "Match all pairs of hidden cards to win." },
          { name: "❓ Trivia", value: "Answer 5 multiple-choice questions correctly." }
        )
        .setFooter({ text: "Page 2/3" }),

      new EmbedBuilder()
        .setTitle("🎯 Multiplayer Games")
        .setColor("#F04747")
        .setDescription("Challenge your friends!")
        .addFields(
          { name: "⭕ TicTacToe", value: "Get 3 in a row (horizontal, vertical, or diagonal)." },
          { name: "✊ Rock Paper Scissors", value: "Rock beats Scissors, Scissors beats Paper, Paper beats Rock." },
          { name: "🔴 Connect 4", value: "Connect 4 discs in a row to win." },
          { name: "⚪ Reversi (Othello)", value: "Flip discs and control the board to win." }
        )
        .setFooter({ text: "Page 3/3" }),
    ];

    let currentPage = 0;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("prev").setLabel("⬅️ Prev").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("next").setLabel("Next ➡️").setStyle(ButtonStyle.Primary)
    );

    const message = await interaction.reply({
      embeds: [pages[currentPage]],
      components: [row],
      ephemeral: false
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000
    });

    collector.on("collect", async (i) => {
      if (i.customId === "prev") {
        currentPage = (currentPage - 1 + pages.length) % pages.length;
      } else if (i.customId === "next") {
        currentPage = (currentPage + 1) % pages.length;
      }
      await i.update({ embeds: [pages[currentPage]], components: [row] });
    });

    collector.on("end", async () => {
      await message.edit({ components: [] }); // Disable buttons after timeout
    });
  }
};
