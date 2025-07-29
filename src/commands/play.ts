import { SlashCommandBuilder } from "discord.js";
import { GameManager } from "../managers/GameManager";
import { TicTacToe } from "../games/TicTacToe";
import { RockPaperScissors } from "../games/RockPaperScissors";
import { Wordle } from "../games/Wordle";
import { Minesweeper } from "../games/Minesweeper";
import { MemoryMatch } from "../games/MemoryMatch";
import { Trivia } from "../games/Trivia";
import { Game2048 } from "../games/Game2048";
import { Connect4 } from "../games/Connect4";
import { Reversi } from "../games/Reversi";

export const command = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Start a minigame")
    .addStringOption(opt => 
      opt.setName("game")
        .setDescription("Game name")
        .setRequired(true)
        .addChoices(
          { name: "Tic-Tac-Toe", value: "tictactoe" },
          { name: "Rock-Paper-Scissors", value: "rps" },
          { name: "Wordle", value: "wordle" },
          { name: "Minesweeper", value: "minesweeper"},
          { name: "Memory Match", value: "memory"},
          { name: "Trivia", value: "trivia"},
          // { name: "2048", value: "game2048"},
          { name: "Connect4", value: "connect4"},
          { name: "Reversi", value: "reversi" },
        )
    )
    .addUserOption(opt => 
      opt.setName("opponent")
        .setDescription("Select your opponent (only for multiplayer games)")
        .setRequired(false) // opponent is now optional
    ),

  async execute(interaction: any) {
    const gameName = interaction.options.getString("game");
    const opponent = interaction.options.getUser("opponent");

    // Multiplayer games list
    const multiplayerGames = ["tictactoe", "rps", "connect4", "reversi"];
    const isMultiplayer = multiplayerGames.includes(gameName);

    // Validate opponent for multiplayer games
    if (isMultiplayer) {
        if (!opponent) {
            return interaction.reply({
                content: "❌ This game requires an opponent! Please select a valid user.",
                ephemeral: true,
            });
        }
        if (opponent.bot) {
            return interaction.reply({
                content: "❌ You can't play against a bot!",
                ephemeral: true,
            });
        }
        if (opponent.id === interaction.user.id) {
            return interaction.reply({
                content: "❌ You can't play against yourself!",
                ephemeral: true,
            });
        }
    }

    let gameInstance;
    switch (gameName) {
        case "tictactoe":
            gameInstance = new TicTacToe(interaction.user.id, opponent.id);
            break;
        case "rps":
            gameInstance = new RockPaperScissors(interaction.user.id, opponent.id);
            break;
        case "connect4":
            gameInstance = new Connect4(interaction.user.id, opponent.id);
            break;
        case "reversi":
            gameInstance = new Reversi(interaction.user.id, opponent.id);
            break;
        case "wordle":
            gameInstance = new Wordle(interaction.user.id);
            break;
        case "minesweeper":
            gameInstance = new Minesweeper(interaction.user.id);
            break;
        case "memory":
            gameInstance = new MemoryMatch(interaction.user.id);
            break;
        case "trivia":
            gameInstance = new Trivia(interaction.user.id);
            break;
        default:
            return interaction.reply({
                content: "Unknown game!",
                ephemeral: true,
            });
    }

    GameManager.createGame(interaction.channelId, gameInstance);
    await interaction.reply(await gameInstance.start());
}
};
