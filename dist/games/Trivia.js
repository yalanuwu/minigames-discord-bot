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
exports.Trivia = void 0;
const discord_js_1 = require("discord.js");
const entities_1 = require("entities");
class Trivia {
    constructor(player) {
        this.questions = [];
        this.answers = [];
        this.currentIndex = 0;
        this.score = 0;
        this.finished = false;
        this.totalQuestions = 5;
        this.player = player;
    }
    getName() {
        return "Trivia";
    }
    getDescription() {
        return "Answer 5 random trivia questions!";
    }
    isMultiplayer() {
        return false;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchQuestions();
            return {
                content: `**Trivia started!**\nQuestion 1/${this.totalQuestions}:\n${this.decodeHtml(this.questions[0].question)}`,
                components: this.buildQuestionUI(this.questions[0].options),
            };
        });
    }
    fetchQuestions() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`https://opentdb.com/api.php?amount=${this.totalQuestions}&type=multiple`);
            const data = (yield response.json());
            this.questions = data.results.map((q) => {
                const options = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
                return { question: q.question, correct: q.correct_answer, options };
            });
        });
    }
    handleMove(interaction) {
        if (interaction.user.id !== this.player)
            return { content: "This is not your game!", components: [] };
        if (this.finished)
            return null;
        const choice = this.decodeHtml(interaction.customId.replace("trivia_", ""));
        const currentQ = this.questions[this.currentIndex];
        const correctAnswer = this.decodeHtml(currentQ.correct);
        const isCorrect = choice === correctAnswer;
        if (isCorrect)
            this.score++;
        // Save answer for review
        this.answers.push({
            question: currentQ.question,
            selected: choice,
            correct: correctAnswer,
            isCorrect,
        });
        this.currentIndex++;
        // Game over
        if (this.currentIndex >= this.totalQuestions) {
            this.finished = true;
            return {
                content: this.buildSummary(),
                components: [],
            };
        }
        return {
            content: `Question ${this.currentIndex + 1}/${this.totalQuestions}:\n${this.decodeHtml(this.questions[this.currentIndex].question)}`,
            components: this.buildQuestionUI(this.questions[this.currentIndex].options),
        };
    }
    isGameOver() {
        return this.finished;
    }
    buildQuestionUI(options) {
        const buttons = options.map((opt) => new discord_js_1.ButtonBuilder()
            .setCustomId(`trivia_${opt}`)
            .setLabel(this.decodeHtml(opt))
            .setStyle(discord_js_1.ButtonStyle.Primary));
        return [new discord_js_1.ActionRowBuilder().addComponents(buttons)];
    }
    buildSummary() {
        let summary = `🎉 **Game Over!**\nYour score: **${this.score}/${this.totalQuestions}**\n\n`;
        summary += `**Review:**\n`;
        this.answers.forEach((a, i) => {
            summary += `\n**Q${i + 1}:** ${this.decodeHtml(a.question)}\n`;
            summary += `Your Answer: ${a.isCorrect ? "✅" : "❌"} ${this.decodeHtml(a.selected)}\n`;
            if (!a.isCorrect) {
                summary += `Correct Answer: **${this.decodeHtml(a.correct)}**\n`;
            }
        });
        return summary;
    }
    decodeHtml(str) {
        return (0, entities_1.decode)(str);
    }
}
exports.Trivia = Trivia;
