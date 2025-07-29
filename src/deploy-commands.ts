import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const commands: any[] = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(process.env.NODE_ENV === "production" ? ".js" : ".ts"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

// Choose mode via CLI argument: "guild" for fast testing, "global" for production
const mode = process.argv[2] || "global"; // default to global

(async () => {
  try {
    console.log(`Deploying ${mode} commands...`);
    if (mode === "guild") {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
        { body: commands }
      );
      console.log("✅ Guild commands deployed (instant).");
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID!), // GLOBAL
        { body: commands }
      );
      console.log("🌍 Global commands deployed! (May take up to 1 hour to update)");
    }
  } catch (error) {
    console.error("❌ Error deploying commands:", error);
  }
})();
