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
exports.command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows information and rules for all available games."),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // Pages
            const pages = [
                new discord_js_1.EmbedBuilder()
                    .setTitle("🎮 MiniGames Bot - Help")
                    .setDescription("Welcome! Use `/play [game]` to start.\n\n**Categories:**\n➡️ Single-player games\n➡️ Multiplayer games\n\nUse the buttons below to switch pages.")
                    .setColor("#5865F2")
                    .addFields({ name: "📜 Commands", value: "`/play [game]` - Start a game\n`/help` - Show this menu\n`/end` - To end an ongoing game" }, { name: "ℹ️ Note", value: "Some games require an opponent. If you don’t pick one, the bot will warn you." })
                    .setFooter({ text: "Page 1/3" }),
                new discord_js_1.EmbedBuilder()
                    .setTitle("🎮 Single-Player Games")
                    .setColor("#43B581")
                    .setDescription("Games you can play alone:")
                    .addFields({ name: "🟩 Wordle", value: "Guess the hidden 5-letter word in 6 tries." }, { name: "💣 Minesweeper", value: "Clear the grid without hitting a mine." }, { name: "🧠 Memory Match", value: "Match all pairs of hidden cards to win." }, { name: "❓ Trivia", value: "Answer 5 multiple-choice questions correctly." })
                    .setFooter({ text: "Page 2/3" }),
                new discord_js_1.EmbedBuilder()
                    .setTitle("🎯 Multiplayer Games")
                    .setColor("#F04747")
                    .setDescription("Challenge your friends!")
                    .addFields({ name: "⭕ TicTacToe", value: "Get 3 in a row (horizontal, vertical, or diagonal)." }, { name: "✊ Rock Paper Scissors", value: "Rock beats Scissors, Scissors beats Paper, Paper beats Rock." }, { name: "🔴 Connect 4", value: "Connect 4 discs in a row to win." }, { name: "⚪ Reversi (Othello)", value: "Flip discs and control the board to win." })
                    .setFooter({ text: "Page 3/3" }),
            ];
            let currentPage = 0;
            const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId("prev").setLabel("⬅️ Prev").setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId("next").setLabel("Next ➡️").setStyle(discord_js_1.ButtonStyle.Primary));
            const message = yield interaction.reply({
                embeds: [pages[currentPage]],
                components: [row],
                ephemeral: false
            });
            const collector = message.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                time: 60000
            });
            collector.on("collect", (i) => __awaiter(this, void 0, void 0, function* () {
                if (i.customId === "prev") {
                    currentPage = (currentPage - 1 + pages.length) % pages.length;
                }
                else if (i.customId === "next") {
                    currentPage = (currentPage + 1) % pages.length;
                }
                yield i.update({ embeds: [pages[currentPage]], components: [row] });
            }));
            collector.on("end", () => __awaiter(this, void 0, void 0, function* () {
                yield message.edit({ components: [] }); // Disable buttons after timeout
            }));
        });
    }
};
