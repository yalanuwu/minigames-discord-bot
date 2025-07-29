"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
const Wordle_1 = require("./games/Wordle");
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const GameManager_1 = require("./managers/GameManager");
const Minesweeper_1 = require("./games/Minesweeper");
const MemoryMatch_1 = require("./games/MemoryMatch");
const Trivia_1 = require("./games/Trivia");
const Connect4_1 = require("./games/Connect4");
const express_1 = __importDefault(require("express"));
dotenv.config();
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages],
});
// Load commands dynamically
const commands = new discord_js_1.Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(process.env.NODE_ENV === "production" ? ".js" : ".ts"));
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.set(command.command.data.name, command.command);
}
client.once("ready", () => {
    var _a;
    console.log(`✅ Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
});
client.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (interaction.isChatInputCommand()) {
        const command = commands.get(interaction.commandName);
        if (command)
            yield command.execute(interaction);
    }
    if (interaction.isButton() && interaction.customId === "wordle_guess") {
        const game = GameManager_1.GameManager.getGame(interaction.channelId);
        if (!game || !(game instanceof Wordle_1.Wordle))
            return;
        const modal = new discord_js_2.ModalBuilder()
            .setCustomId("wordle_modal")
            .setTitle("Enter your guess")
            .addComponents(new discord_js_2.ActionRowBuilder().addComponents(new discord_js_2.TextInputBuilder()
            .setCustomId("guess_input")
            .setLabel("5-letter word")
            .setStyle(discord_js_2.TextInputStyle.Short)
            .setMinLength(5)
            .setMaxLength(5)
            .setRequired(true)));
        return interaction.showModal(modal);
    }
    if (interaction.isModalSubmit() &&
        interaction.customId === "wordle_modal") {
        if (!interaction.channelId)
            return;
        const game = GameManager_1.GameManager.getGame(interaction.channelId);
        if (!game || !(game instanceof Wordle_1.Wordle))
            return;
        const guess = interaction.fields.getTextInputValue("guess_input");
        const response = game.handleGuess(guess);
        yield ((_a = interaction.message) === null || _a === void 0 ? void 0 : _a.edit(response)); // <-- edit original message instead
        yield interaction.deferUpdate(); // acknowledges modal submission
        if (game.isGameOver())
            GameManager_1.GameManager.removeGame(interaction.channelId);
    }
    if (interaction.isButton()) {
        // Handle Play Again button
        if (interaction.customId.startsWith("playagain_")) {
            const [, gameName, player1, player2] = interaction.customId.split("_");
            let gameInstance;
            switch (gameName) {
                case "tictactoe":
                    const { TicTacToe } = require("./games/TicTacToe");
                    gameInstance = new TicTacToe(player1, player2);
                    break;
                case "rps":
                    const { RockPaperScissors, } = require("./games/RockPaperScissors");
                    gameInstance = new RockPaperScissors(player1, player2);
                    break;
                case "wordle":
                    gameInstance = new Wordle_1.Wordle(player1);
                    break;
                case "minesweeper":
                    gameInstance = new Minesweeper_1.Minesweeper(player1); // <-- ADD THIS
                    break;
                case "memory":
                    gameInstance = new MemoryMatch_1.MemoryMatch(player1);
                    break;
                case "trivia":
                    gameInstance = new Trivia_1.Trivia(player1);
                    break;
                case "connect4":
                    gameInstance = new Connect4_1.Connect4(player1, player2);
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
            GameManager_1.GameManager.createGame(interaction.channelId, gameInstance);
            return yield interaction.update(yield gameInstance.start());
        }
        // Handle normal in-game buttons
        const game = GameManager_1.GameManager.getGame(interaction.channelId);
        if (!game)
            return;
        const response = game.handleMove(interaction);
        if (response)
            yield interaction.update(response);
        if (game.isGameOver())
            GameManager_1.GameManager.removeGame(interaction.channelId);
    }
}));
client.login(process.env.DISCORD_TOKEN);
const app = (0, express_1.default)();
app.get("/", (_, res) => {
    res.send("Bot is running!");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
});
