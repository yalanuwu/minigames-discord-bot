import {
    Client,
    GatewayIntentBits,
    Collection,
    Interaction,
    ButtonInteraction,
} from "discord.js";
import {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} from "discord.js";
import { Wordle } from "./games/Wordle";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { GameManager } from "./managers/GameManager";
import { Minesweeper } from "./games/Minesweeper";
import { MemoryMatch } from "./games/MemoryMatch";
import { Trivia } from "./games/Trivia";
import { Game2048 } from "./games/Game2048";
import { Connect4 } from "./games/Connect4";

import express from "express";

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Load commands dynamically
const commands = new Collection<string, any>();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(process.env.NODE_ENV === "production" ? ".js" : ".ts"));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.set(command.command.data.name, command.command);
}

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = commands.get(interaction.commandName);
        if (command) await command.execute(interaction);
    }

    if (interaction.isButton() && interaction.customId === "wordle_guess") {
        const game = GameManager.getGame(interaction.channelId);
        if (!game || !(game instanceof Wordle)) return;

        const modal = new ModalBuilder()
            .setCustomId("wordle_modal")
            .setTitle("Enter your guess")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId("guess_input")
                        .setLabel("5-letter word")
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(5)
                        .setMaxLength(5)
                        .setRequired(true)
                )
            );
        return interaction.showModal(modal);
    }

    if (
        interaction.isModalSubmit() &&
        interaction.customId === "wordle_modal"
    ) {
        if (!interaction.channelId) return;
        const game = GameManager.getGame(interaction.channelId);
        if (!game || !(game instanceof Wordle)) return;

        const guess = interaction.fields.getTextInputValue("guess_input");
        const response = game.handleGuess(guess);
        await interaction.message?.edit(response); // <-- edit original message instead
        await interaction.deferUpdate(); // acknowledges modal submission

        if (game.isGameOver()) GameManager.removeGame(interaction.channelId);
    }

    if (interaction.isButton()) {
        // Handle Play Again button
        if (interaction.customId.startsWith("playagain_")) {
            const [, gameName, player1, player2] =
                interaction.customId.split("_");
            let gameInstance;
            switch (gameName) {
                case "tictactoe":
                    const { TicTacToe } = require("./games/TicTacToe");
                    gameInstance = new TicTacToe(player1, player2);
                    break;
                case "rps":
                    const {
                        RockPaperScissors,
                    } = require("./games/RockPaperScissors");
                    gameInstance = new RockPaperScissors(player1, player2);
                    break;
                case "wordle":
                    gameInstance = new Wordle(player1);
                    break;
                case "minesweeper":
                    gameInstance = new Minesweeper(player1); // <-- ADD THIS
                    break;
                case "memory":
                    gameInstance = new MemoryMatch(player1);
                    break;
                case "trivia":
                    gameInstance = new Trivia(player1);
                    break;
                case "connect4":
                    gameInstance = new Connect4(player1, player2);
                    break;
                // case "game2048":
                //     gameInstance = new Game2048(player1);
                //     break;
                default:
                    return interaction.reply({
                        content: "Unknown game type!",
                        ephemeral: true,
                    });
            }
            GameManager.createGame(interaction.channelId, gameInstance);
            return await interaction.update(await gameInstance.start());
        }

        // Handle normal in-game buttons
        const game = GameManager.getGame(interaction.channelId);
        if (!game) return;
        const response = game.handleMove(interaction);
        if (response) await interaction.update(response);
        if (game.isGameOver()) GameManager.removeGame(interaction.channelId);
    }
});

client.login(process.env.DISCORD_TOKEN);

const app = express();

app.get("/", (_, res) => {
  res.send("Bot is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

