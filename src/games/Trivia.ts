import {
  InteractionReplyOptions,
  InteractionUpdateOptions,
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Game } from "./GameInterface";
import { decode } from "entities";

interface TriviaAPIResponse {
  results: {
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
  }[];
}

export class Trivia implements Game {
  private player: string;
  private questions: { question: string; correct: string; options: string[] }[] = [];
  private answers: { question: string; selected: string; correct: string; isCorrect: boolean }[] = [];
  private currentIndex = 0;
  private score = 0;
  private finished = false;
  private totalQuestions = 5;

  constructor(player: string) {
    this.player = player;
  }

  getName() {
    return "Trivia";
  }

  getDescription() {
    return "Answer 5 random trivia questions!";
  }

  isMultiplayer(): boolean {
    return false;
  }

  async start(): Promise<InteractionReplyOptions> {
    await this.fetchQuestions();
    return {
      content: `**Trivia started!**\nQuestion 1/${this.totalQuestions}:\n${this.decodeHtml(this.questions[0].question)}`,
      components: this.buildQuestionUI(this.questions[0].options),
    };
  }

  private async fetchQuestions() {
    const response = await fetch(
      `https://opentdb.com/api.php?amount=${this.totalQuestions}&type=multiple`
    );
    const data = (await response.json()) as TriviaAPIResponse;

    this.questions = data.results.map((q) => {
      const options = [...q.incorrect_answers, q.correct_answer].sort(
        () => Math.random() - 0.5
      );
      return { question: q.question, correct: q.correct_answer, options };
    });
  }

  handleMove(interaction: ButtonInteraction): InteractionUpdateOptions | null {
    if (interaction.user.id !== this.player)
      return { content: "This is not your game!", components: [] };

    if (this.finished) return null;

    const choice = this.decodeHtml(interaction.customId.replace("trivia_", ""));
    const currentQ = this.questions[this.currentIndex];
    const correctAnswer = this.decodeHtml(currentQ.correct)

    const isCorrect = choice === correctAnswer;
    if (isCorrect) this.score++;

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
      content: `Question ${this.currentIndex + 1}/${this.totalQuestions}:\n${this.decodeHtml(
        this.questions[this.currentIndex].question
      )}`,
      components: this.buildQuestionUI(this.questions[this.currentIndex].options),
    };
  }

  isGameOver(): boolean {
    return this.finished;
  }

  private buildQuestionUI(options: string[]) {
    const buttons = options.map((opt) =>
      new ButtonBuilder()
        .setCustomId(`trivia_${opt}`)
        .setLabel(this.decodeHtml(opt))
        .setStyle(ButtonStyle.Primary)
    );

    return [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)];
  }

  private buildSummary(): string {
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

  private decodeHtml(str: string): string {
    return decode(str);
  }
}
