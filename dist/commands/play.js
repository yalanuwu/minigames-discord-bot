"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const GameManager_1 = require("../managers/GameManager");
const TicTacToe_1 = require("../games/TicTacToe");
const RockPaperScissors_1 = require("../games/RockPaperScissors");
const Wordle_1 = require("../games/Wordle");
const Minesweeper_1 = require("../games/Minesweeper");
const MemoryMatch_1 = require("../games/MemoryMatch");
const Trivia_1 = require("../games/Trivia");
const Connect4_1 = require("../games/Connect4");
const Reversi_1 = require("../games/Reversi");
exports.command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("play")
        .setDescription("Start a minigame")
        .addStringOption(opt => opt.setName("game")
        .setDescription("Game name")
        .setRequired(true)
        .addChoices({ name: "Tic-Tac-Toe", value: "tictactoe" }, { name: "Rock-Paper-Scissors", value: "rps" }, { name: "Wordle", value: "wordle" }, { name: "Minesweeper", value: "minesweeper" }, { name: "Memory Match", value: "memory" }, { name: "Trivia", value: "trivia" }, 
    // { name: "2048", value: "game2048"},
    { name: "Connect4", value: "connect4" }, { name: "Reversi", value: "reversi" }))
        .addUserOption(opt => opt.setName("opponent")
        .setDescription("Select your opponent (only for multiplayer games)")
        .setRequired(false) // opponent is now optional
    ),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    gameInstance = new TicTacToe_1.TicTacToe(interaction.user.id, opponent.id);
                    break;
                case "rps":
                    gameInstance = new RockPaperScissors_1.RockPaperScissors(interaction.user.id, opponent.id);
                    break;
                case "connect4":
                    gameInstance = new Connect4_1.Connect4(interaction.user.id, opponent.id);
                    break;
                case "reversi":
                    gameInstance = new Reversi_1.Reversi(interaction.user.id, opponent.id);
                    break;
                case "wordle":
                    gameInstance = new Wordle_1.Wordle(interaction.user.id);
                    break;
                case "minesweeper":
                    gameInstance = new Minesweeper_1.Minesweeper(interaction.user.id);
                    break;
                case "memory":
                    gameInstance = new MemoryMatch_1.MemoryMatch(interaction.user.id);
                    break;
                case "trivia":
                    gameInstance = new Trivia_1.Trivia(interaction.user.id);
                    break;
                default:
                    return interaction.reply({
                        content: "Unknown game!",
                        ephemeral: true,
                    });
            }
            GameManager_1.GameManager.createGame(interaction.channelId, gameInstance);
            yield interaction.reply(yield gameInstance.start());
        });
    }
};
