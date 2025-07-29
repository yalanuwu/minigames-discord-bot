"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPlayAgainButton = buildPlayAgainButton;
const discord_js_1 = require("discord.js");
function buildPlayAgainButton(gameName, player1, player2) {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`playagain_${gameName}_${player1}_${player2}`)
            .setLabel("🔄 Play Again")
            .setStyle(discord_js_1.ButtonStyle.Success))
    ];
}
