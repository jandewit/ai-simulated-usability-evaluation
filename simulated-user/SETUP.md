# 🤖 Simulated User - Setup & Getting Started

Welcome! This guide will get you up and running in 10 minutes.

## What You're Building

An intelligent AI bot that:
- 📸 Takes screenshots of websites
- 🧠 Uses GPT-4 Vision to analyze them
- 🎯 Decides what to click/type/scroll next
- 📊 Generates beautiful attention heatmaps
- 📈 Creates detailed usability reports

Perfect for testing website flows and understanding user experience patterns.

## ⚡ Quick Setup (10 minutes)

### Step 1: Get Your OpenAI API Key (2 minutes)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Click "API keys" in the left sidebar
3. Click "Create new secret key"
4. Copy the key (you'll need it in a moment)
5. Keep this key private! ⚠️

### Step 2: Clone/Initialize Project (1 minute)

```bash
cd simulated-user
```

### Step 3: Install Dependencies (3 minutes)

```bash
npm install
```

This installs:
- OpenAI SDK for GPT-4 Vision
- Playwright for browser automation
- TypeScript tools
- Other utilities

### Step 4: Create .env File (1 minute)

```bash
cp .env.example .env
```

Now edit `.env`:
```bash
# Windows
notepad .env

# Mac/Linux
nano .env
```

Paste this (replace with your actual key):
```env
OPENAI_API_KEY=sk-your-actual-key-here
TARGET_URL=https://example.com
USER_GOAL=Find the sign up button
MAX_ITERATIONS=5
```

### Step 5: Run It! (3 minutes)

```bash
npm run dev
```

Watch as:
1. Browser opens
2. Screenshots are taken
3. AI analyzes each one
4. Reports are generated

### Step 6: View Results (1 minute)

Open in your browser:
```bash
# Windows
start output/index.html

# Mac
open output/index.html

# Linux
xdg-open output/index.html
```

**That's it! 🎉**

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **[README.md](./README.md)** | Full documentation |
| **[QUICKSTART.md](./QUICKSTART.md)** | Quick reference |
| **[EXAMPLES.md](./EXAMPLES.md)** | Practical examples |
| **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** | Architecture & deep dive |

## 🎯 First Steps

### Try Example 1: Simple Exploration
```bash
# Already set in .env if following above
npm run dev
```

### Try Example 2: Specific Goal
Edit `.env`:
```env
TARGET_URL=https://github.com
USER_GOAL=Find the GitHub Copilot page
```

Then:
```bash
npm run dev
```

### Try Example 3: Multiple Goals
See [EXAMPLES.md](./EXAMPLES.md) for batch testing.

---

## 📂 Project Structure

```
simulated-user/
├── src/                    # TypeScript source code
│   ├── main.ts            # Entry point
│   ├── simulatedUser.ts   # Main orchestrator
│   ├── visionAnalyzer.ts  # OpenAI integration
│   ├── browserController.ts
│   ├── heatmapGenerator.ts
│   └── types.ts
├── output/                # Generated reports (created after first run)
├── dist/                  # Compiled JavaScript (created after npm run build)
├── .env                   # Your configuration (create this)
├── package.json
├── tsconfig.json
├── README.md
├── QUICKSTART.md
├── EXAMPLES.md
└── PROJECT_OVERVIEW.md
```

---

## 🔧 Available Commands

```bash
# Run the main simulation
npm run dev

# Verify setup is correct
npm run verify

# Build TypeScript to JavaScript
npm run build

# Run compiled version
npm start

# Run example
npm run example
```

---

## 🎓 Understanding the Output

### index.html (Main Report)
Shows:
- Timeline of all actions
- Screenshots from each step
- Links to detailed heatmaps
- AI confidence scores

### heatmap_N.html (Detailed Visualization)
Shows:
- Original screenshot
- Red circles = where AI was looking
- Bright = very focused
- Dim = barely noticed

### screenshot_N.png
Raw browser screenshot from iteration N

### session_report.json
Raw data - good for analysis and automation

---

## 💡 Tips for Success

### 1. Start Simple
- Use `example.com` or similar for first test
- Use a specific, clear goal
- Set `MAX_ITERATIONS=5` initially

### 2. Set Good Goals
Good:
- "Find the login button"
- "Add a product to cart"
- "Subscribe to the newsletter"

Bad:
- "Browse the website"
- "Look around"
- "Explore"

### 3. Review Heatmaps
- Look at red circles
- Ask: "Is the AI looking at the right things?"
- Identify confusing UI elements
- Check if important buttons are hard to find

### 4. Watch for Loops
- If AI keeps clicking the same thing, let it run more iterations
- Or increase `MAX_ITERATIONS`
- Review attention heatmaps to understand why

### 5. Monitor Costs
- Each iteration ≈ $0.03-0.08
- 5 iterations ≈ $0.15-0.40
- Check [platform.openai.com/usage](https://platform.openai.com/usage)

---

## 🚀 Level Up

### Programmatic Usage
Instead of running from command line, use in your code:

```typescript
import { SimulatedUser } from "./src/simulatedUser";

const user = new SimulatedUser({
  targetUrl: "https://example.com",
  apiKey: process.env.OPENAI_API_KEY,
  userGoal: "Find the pricing page",
  maxIterations: 7,
  outputDir: "./output/my-test",
});

const session = await user.run();
console.log(`Completed: ${session.steps.length} steps`);
```

### Batch Testing
Test multiple goals on the same website:

See [EXAMPLES.md - Example 6](./EXAMPLES.md#example-6-multiple-tests-in-sequence)

### Custom Analysis
Extract insights from reports:

See [EXAMPLES.md - Example 7](./EXAMPLES.md#example-7-analyzing-results)

---

## ⚠️ Troubleshooting

### "OPENAI_API_KEY is required"
- Did you create `.env` file?
- Is your API key correct? (should start with `sk-`)
- Is the key valid at [platform.openai.com](https://platform.openai.com)?

### "Cannot find module openai"
```bash
npm install
```

### Browser not opening
```bash
export HEADLESS=false
npm run dev
```
This shows the browser UI for debugging.

### "Playwright browsers not found"
```bash
npx playwright install chromium
```

### High costs
- Use smaller websites
- Reduce `MAX_ITERATIONS`
- Batch similar tests

See [QUICKSTART.md](./QUICKSTART.md#troubleshooting) for more.

---

## 🔄 Workflow

```
1. Configure .env
   ↓
2. npm run dev
   ↓
3. Wait 30 seconds - 2 minutes
   ↓
4. Open output/index.html
   ↓
5. Review results and heatmaps
   ↓
6. Identify UI improvements
   ↓
7. Repeat with different goal or website
```

---

## 📊 Sample Output Structure

```
output/
├── index.html              # Main report
├── heatmap_1.html
├── heatmap_2.html
├── heatmap_3.html
├── screenshot_1.png
├── screenshot_2.png
├── screenshot_3.png
├── heatmap_1.svg
├── heatmap_2.svg
├── heatmap_3.svg
└── session_report.json
```

Each iteration produces:
- 1 screenshot (PNG)
- 1 heatmap (SVG)
- 1 HTML visualization
- Recorded in session JSON

---

## 🎓 Learning Resources

- **OpenAI Vision**: [docs](https://platform.openai.com/docs/guides/vision)
- **Playwright**: [docs](https://playwright.dev)
- **TypeScript**: [docs](https://www.typescriptlang.org)

---

## 🆘 Still Stuck?

1. Check [QUICKSTART.md](./QUICKSTART.md)
2. Review [EXAMPLES.md](./EXAMPLES.md)
3. Read [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
4. Run `npm run verify` to check setup
5. Enable `HEADLESS=false` to debug

---

## 📝 Next: Real Testing

Ready to test a real website?

1. Update `.env` with your target URL
2. Set a clear `USER_GOAL`
3. Set `MAX_ITERATIONS` based on task complexity
4. Run `npm run dev`
5. Review reports and iterate

---

## 🎉 You're Ready!

Your simulated user testing tool is ready to go.

**Next command:**
```bash
npm run dev
```

Good luck! 🚀
