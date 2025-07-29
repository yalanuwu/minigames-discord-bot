import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    InteractionReplyOptions,
    ButtonInteraction,
    InteractionUpdateOptions,
} from "discord.js";
import { Game } from "./GameInterface";
import { buildPlayAgainButton } from "../utils/PlayAgainButton";

export class TicTacToe implements Game {
    board: string[];
    players: string[];
    currentTurn: number;
    winner: string | null;

    constructor(player1: string, player2: string) {
        this.board = Array(9).fill(" ");
        this.players = [player1, player2];
        this.currentTurn = 0;
        this.winner = null;
    }

    getName() {
        return "Tic-Tac-Toe";
    }
    getDescription() {
        return "Classic 2-player Tic-Tac-Toe";
    }

    private buildButtons(): ActionRowBuilder<ButtonBuilder>[] {
        const rows: ActionRowBuilder<ButtonBuilder>[] = [];
        for (let i = 0; i < 3; i++) {
            const row = new ActionRowBuilder<ButtonBuilder>();
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                const symbol =
                    this.board[index] === " "
                        ? "⬜"
                        : this.board[index] === "X"
                        ? "❌"
                        : "⭕";
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`move_${index}`)
                        .setLabel(symbol)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(
                            this.board[index] !== " " || this.winner !== null
                        )
                );
            }
            rows.push(row);
        }
        return rows;
    }

    isMultiplayer(): boolean {
        return true;
    }

    async start(): Promise<InteractionReplyOptions> {
        return {
            content: `Tic-Tac-Toe: <@${this.players[0]}> (X) vs <@${
                this.players[1]
            }> (O)\n<@${this.players[this.currentTurn]}> goes first.`,
            components: this.buildButtons(),
        };
    }

    handleMove(
        interaction: ButtonInteraction
    ): InteractionUpdateOptions | null {
        const index = parseInt(interaction.customId.split("_")[1]);
        if (this.board[index] !== " " || this.winner) return null;
        if (interaction.user.id !== this.players[this.currentTurn]) {
            interaction.reply({
                content: "It's not your turn!",
                ephemeral: true,
            });
            return null;
        }

        this.board[index] = this.currentTurn === 0 ? "X" : "O";
        if (this.checkWin()) {
            this.winner = this.players[this.currentTurn];
        } else if (!this.board.includes(" ")) {
            this.winner = "draw";
        } else {
            this.currentTurn = 1 - this.currentTurn;
        }

        return {
            content: this.winner
                ? this.winner === "draw"
                    ? "It's a draw!"
                    : `Game Over! <@${this.winner}> wins!`
                : `Tic-Tac-Toe ongoing. <@${
                      this.players[this.currentTurn]
                  }>'s turn.`,
            components:
                this.winner !== null
                    ? buildPlayAgainButton(
                          "tictactoe",
                          this.players[0],
                          this.players[1]
                      )
                    : this.buildButtons(),
        };
    }

    private checkWin(): boolean {
        const combos = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        return combos.some(
            (c) =>
                this.board[c[0]] !== " " &&
                this.board[c[0]] === this.board[c[1]] &&
                this.board[c[1]] === this.board[c[2]]
        );
    }

    isGameOver(): boolean {
        return this.winner !== null;
    }
}
