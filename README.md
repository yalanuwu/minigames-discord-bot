# 🎮 Minigames Discord Bot

A **feature-rich Discord bot** that lets you play multiple fun games with friends directly in your server!  
Built with **TypeScript** and **Discord.js v14**, this bot supports both **single-player** and **multiplayer** games.

---

## 🚀 Features

- **Multiple Games**:
  - Tic-Tac-Toe (Multiplayer)
  - Rock-Paper-Scissors (Multiplayer)
  - Wordle (Single-player)
  - Minesweeper (Single-player)
  - Memory Match (Single-player)
  - Trivia Quiz (Single-player)
  - Connect 4 (Multiplayer)
  - Reversi (Multiplayer, 6x6 board)
- **Global Slash Commands** (`/play`, `/help`)
- **Interactive Buttons** for smooth gameplay
- **Paginated Help Menu** with categories
- **Play Again** option after each match

---

## 🕹 Game Rules

### **Tic-Tac-Toe**
Two players take turns placing **❌** and **⭕**.  
First to get **3 in a row** (horizontally, vertically, or diagonally) wins.  
If the grid fills up with no winner, it’s a draw.

### **Rock-Paper-Scissors**
Two players select one of **Rock 🪨**, **Paper 📄**, or **Scissors ✂️**.  
**Rock beats Scissors**, **Scissors beat Paper**, **Paper beats Rock**.  
Best of one — winner is decided instantly.

### **Wordle**
Guess a **5-letter word** in 6 attempts.  
Correct letters in the **right place** are shown in **green**.  
Correct letters in the **wrong place** are shown in **yellow**.  
Try to solve before you run out of attempts.

### **Minesweeper**
Reveal tiles without hitting a mine.  
Numbers show how many mines are adjacent to that tile.  
Goal: Clear all safe tiles without clicking on a mine.

### **Memory Match**
Flip over two cards per turn.  
If they match, they stay revealed.  
Goal: Match all pairs in as few moves as possible.

### **Trivia**
Answer multiple-choice questions.  
Earn points for correct answers.  
Play until all questions are answered or you quit.

### **Connect 4**
Two players drop discs into a 7x6 grid.  
First to connect **4 in a row** (horizontally, vertically, or diagonally) wins.  
If the grid fills up, it’s a draw.

### **Reversi (6x6)**
Two players take turns placing pieces (🟣 and 🟡).  
Any opponent pieces **between your piece and another of your pieces** get flipped.  
Game ends when no valid moves remain. Player with **most pieces** wins.

---
## 📜 Commands

- `/play [game]` — Start a game
- `/help` — Show help & rules (with pagination)
- `/end` — End current game (if any)

---

## ⚙️ Installation & Hosting

### 1. Clone the repository
```bash
git clone https://github.com/your-username/minigames-discord-bot.git
cd minigames-discord-bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file

A .example.env is given for reference

```env
DISCORD_TOKEN=your-bot-token
CLIENT_ID=your-bot-client-id
GUILD_ID=your-dev-guild-id
PORT=3000
```

### 4. Build the bot
```bash
npm run build
```

### 5. Deploy Commands
```bash
npm run deploy
```

### 6. Start the bot
For development:
```bash
npm run dev
```
For production:
```bash
npm start
```

---

# ☁️ Hosting on Render (Free)

1. Push your project to **GitHub**.
2. Go to [Render](https://render.com/), click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Set **Environment**:  
   - Runtime: `Node`
   - Build Command:  
     ```bash
     npm install && npm run build
     ```
   - Start Command:  
     ```bash
     node dist/index.js
     ```
5. Add **Environment Variables** (from `.env` file) in the Render dashboard.
6. Deploy.  

> **Important:** Render expects a web service. Add a **fake Express server** in your `index.ts`:
```ts
import express from "express";
const app = express();
app.get("/", (_, res) => res.send("Bot is running!"));
app.listen(process.env.PORT || 3000);
```

---

# 🔄 Keep the Bot Alive with UptimeRobot

1. Go to [UptimeRobot](https://uptimerobot.com/).
2. Create a **New Monitor** → **HTTP(s)**.
3. Add your Render service URL (e.g., `https://your-bot.onrender.com`).
4. Set check interval to **5 minutes**.
5. Save — UptimeRobot will ping the bot to keep it awake.


---


# 🛠 Tech Stack

- **Node.js** + **TypeScript**
- **Discord.js v14**
- **Express** (for Render hosting & uptime)
- **UptimeRobot** (for keeping the bot alive)

---

## 🤝 Contributing

Pull requests are welcome!  
If you want to add more games or improve features, feel free to fork and submit a PR.

<!-- ---

## 📜 License

MIT License © 2025 Your Name -->
