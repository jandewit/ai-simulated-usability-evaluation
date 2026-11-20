# Quick Start Guide - Simulated User

## 1. Prerequisites

- **Node.js** 16+ (get it from [nodejs.org](https://nodejs.org))
- **OpenAI API Key** (get it from [platform.openai.com](https://platform.openai.com/api-keys))
- A website URL to test

## 2. Setup (5 minutes)

```bash
# Navigate to project directory
cd simulated-user

# Install dependencies
npm install

# Copy example environment file
cp .env.example .env

# Edit .env with your OpenAI API key
# On Windows: notepad .env
# On Mac/Linux: nano .env
```

Add to `.env`:
```env
OPENAI_API_KEY=sk-your-actual-key-here
TARGET_URL=https://example.com
USER_GOAL=Find the sign up button
```

## 3. Run Your First Test

```bash
npm run dev
```

The script will:
1. 🌐 Launch a browser
2. 📸 Take screenshots
3. 🧠 Send them to GPT-4 Vision for analysis
4. 🎯 Decide what to do next
5. 📊 Generate a detailed report with heatmaps

## 4. View Results

Open `./output/index.html` in your browser to see:
- Timeline of all actions taken
- Screenshots from each step
- AI attention heatmaps
- Decision reasoning and confidence scores

## Common Use Cases

### Test e-commerce checkout flow
```bash
export TARGET_URL="https://www.example-shop.com"
export USER_GOAL="Add a product to cart and proceed to checkout"
npm run dev
```

### Test SaaS signup
```bash
export TARGET_URL="https://www.example-app.com"
export USER_GOAL="Create a new account"
npm run dev
```

### Test documentation site
```bash
export TARGET_URL="https://docs.example.com"
export USER_GOAL="Find the API authentication guide"
npm run dev
```

### General exploration (no specific goal)
```bash
export TARGET_URL="https://www.example.com"
# Just explore naturally without a goal
npm run dev
```

## Configuration Options

| Environment Variable | Required | Purpose |
|----------------------|----------|---------|
| `OPENAI_API_KEY` | ✅ Yes | Your OpenAI API key |
| `TARGET_URL` | ✅ Yes | Website to test |
| `USER_GOAL` | ❌ No | What the AI should try to accomplish |
| `MAX_ITERATIONS` | ❌ No | How many steps to run (default: 5) |
| `OUTPUT_DIR` | ❌ No | Where to save results (default: ./output) |
| `HEADLESS` | ❌ No | Run browser in background (default: true) |

## Understanding the Output

### index.html
Main report showing:
- Session metadata (ID, URL, duration)
- Timeline table with all actions
- Links to detailed heatmaps for each iteration

### heatmap_N.html
Interactive visualization showing:
- Original screenshot
- Red circles indicating where AI was paying attention
- Intensity shows how focused the AI was
- Descriptions of what it was looking at

### screenshot_N.png
Raw browser screenshot from iteration N

### session_report.json
Complete session data in JSON format for programmatic analysis

## Costs

- **Per iteration**: ~$0.03-0.08 (varies by page size)
- **5 iterations**: ~$0.15-0.40
- Monitor usage: [platform.openai.com/usage](https://platform.openai.com/usage)

## Troubleshooting

**"OPENAI_API_KEY is required"**
- Ensure it's set in `.env` file
- Verify the key starts with `sk-`
- Check it's valid at [platform.openai.com](https://platform.openai.com)

**"Cannot find module openai"**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

**Browser not opening**
- Try setting `HEADLESS=false` to see browser UI
- Check if the URL is valid and accessible

**AI keeps clicking the same thing**
- The model might be in a loop - increase `MAX_ITERATIONS` and let it continue
- Or adjust `USER_GOAL` to be more specific

## Next Steps

1. **Modify the code**: Edit `src/main.ts` to customize behavior
2. **Analyze results**: Check `session_report.json` for detailed data
3. **Automate testing**: Run with different URLs in a loop
4. **Integration**: Import `SimulatedUser` class into your test suite

## Learning More

- Full documentation: See [README.md](./README.md)
- OpenAI Vision docs: [platform.openai.com/docs/guides/vision](https://platform.openai.com/docs/guides/vision)
- Playwright docs: [playwright.dev](https://playwright.dev)

## Need Help?

1. Check environment variables are set correctly
2. Verify OpenAI API key is valid
3. Test with a simple website first (e.g., example.com)
4. Enable headless mode off: `HEADLESS=false`
5. Check browser console for errors
