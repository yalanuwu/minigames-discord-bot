import { InteractionReplyOptions, InteractionUpdateOptions, ButtonInteraction } from "discord.js";

export interface Game {
  getName(): string;
  getDescription(): string;
  isMultiplayer(): boolean;
  start(): Promise<InteractionReplyOptions>; // initial reply
  handleMove(interaction: ButtonInteraction): InteractionUpdateOptions | null; // for updates
  isGameOver(): boolean;
}
