# 🤖 Simulated User - AI-Powered Website Usability Testing

An intelligent automation tool that simulates human users interacting with websites. Uses Playwright for browser automation and OpenAI's gpt-6.1-terra (specialized visual reasoning model) to make decisions and generate attention heatmaps.

## Features

✨ **AI-Powered Navigation** – Uses OpenAI's gpt-6.1-terra (visual reasoning model) to analyze website screenshots and decide the next action  
📸 **Attention Heatmaps** – Visualizes where the AI focuses its attention on each page  
🎯 **Goal-Oriented Testing** – Specify user goals and let the AI navigate toward them  
📊 **System Usability Scale (SUS)** – Automatically evaluates website usability on a 0-100 scale  
⏹️ **Smart Early Stopping** – Stops when success is reached or website appears broken  
📋 **Detailed Reports** – Beautiful HTML reports with timeline, screenshots, heatmaps, and SUS evaluation  
🔄 **Multi-Step Sessions** – Tracks complete user journeys across multiple pages  

## Installation

1. **Clone or initialize the project:**
   ```bash
   cd simulated-user
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add:
   - `OPENAI_API_KEY` – Your OpenAI API key
   - `TARGET_URL` – The website to test (e.g., `https://example.com`)
   - `USER_GOAL` – (Optional) What the AI should try to accomplish

## Quick Start

```bash
# Set environment variables
export OPENAI_API_KEY="sk-your-key-here"
export TARGET_URL="https://example.com"
export USER_GOAL="Find the pricing page"

# Run the simulated user
npm run dev
```

The session will:
1. Launch a browser and navigate to the target URL
2. Take a screenshot
3. Send it to gpt-6.1-terra for analysis
4. Get recommended action and attention points
5. Execute the action and repeat
6. Stop early if goal reached or website breaks
7. Evaluate website usability with System Usability Scale
8. Generate HTML report with heatmaps and SUS results

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | - | Your OpenAI API key |
| `TARGET_URL` | ✅ Yes | - | Website URL to test |
| `USER_GOAL` | ❌ No | - | Specific task for the AI (e.g., "Add item to cart") |
| `MAX_ITERATIONS` | ❌ No | 5 | Maximum steps (may stop earlier with early stopping) |
| `OUTPUT_DIR` | ❌ No | ./output | Where to save results |
| `HEADLESS` | ❌ No | true | Run browser in headless mode |

## 📊 System Usability Scale (SUS) & Early Stopping

### SUS Evaluation

After all interactions, the tool automatically evaluates the website using the **official validated 10-item System Usability Scale questionnaire**:

**What you get:**
- **SUS Score:** 0-100 (Industry average: 68, >68 is "good")
- **Adjective:** "poor", "ok", "good", or "excellent"
- **10-Item Responses:** Each question rated 1-5 scale
- **Analysis:** AI-generated reasoning

**The 10 Official SUS Questions:**
1. I think that I would like to use this website frequently.
2. I found the website unnecessarily complex.
3. I thought the website was easy to use.
4. I think that I would need the support of a technical person to be able to use this website.
5. I found the various functions in the website were well integrated.
6. I thought there was too much inconsistency in this website.
7. I imagine that most people would learn to use this website very quickly.
8. I found the website very awkward to use.
9. I felt very confident using the website.
10. I needed to learn a lot of things before I could get going with this website.

**SUS Scoring:**
Uses the official validated formula with reversed scoring for negative questions, calculated from 1-5 responses, scaled to 0-100.

📖 See [SUS_QUESTIONNAIRE.md](./SUS_QUESTIONNAIRE.md) for complete details and interpretation guide.

### Early Stopping

The session automatically stops when:
- **Success:** AI decides no more actions needed (action="none")
- **Failure:** AI confidence drops below 30%
- **Breakdown:** 2+ consecutive low-confidence actions (< 50%)

This means MAX_ITERATIONS acts as a hard upper limit, but most sessions end earlier.

### Example Use Cases

**Test e-commerce checkout:**
```bash
export TARGET_URL="https://shop.example.com"
export USER_GOAL="Add a product to cart and proceed to checkout"
npm run dev
```

**Test SaaS onboarding:**
```bash
export TARGET_URL="https://app.example.com"
export USER_GOAL="Sign up and create an account"
npm run dev
```

**General exploration:**
```bash
export TARGET_URL="https://docs.example.com"
# No USER_GOAL – AI will explore naturally
npm run dev
```

## Output

After running, you'll find in `./output`:

- **index.html** – Main report with SUS evaluation, timeline, and metrics
- **heatmap_1.html, heatmap_2.html, etc.** – Individual iteration heatmaps  
- **screenshot_1.png, screenshot_2.png, etc.** – Browser screenshots
- **heatmap_1.svg, heatmap_2.svg, etc.** – SVG heatmap overlays
- **session_report.json** – Complete session data including SUS evaluation

### Viewing Results

```bash
# Open the main report with SUS evaluation
open ./output/index.html  # macOS
start ./output/index.html  # Windows
xdg-open ./output/index.html  # Linux
```

The HTML report includes:
- **SUS Score** – 0-100 usability rating (poor/ok/good/excellent)
- **Dimension Ratings** – Learnability, efficiency, memorability, error prevention, satisfaction
- **AI Analysis** – Summary of usability strengths and weaknesses
- **Action Timeline** – All steps taken with confidence levels
- **Early Stopping Reason** – Why session ended (if applicable)

## System Usability Scale (SUS) & Early Stopping

### SUS Evaluation

After all interactions, the tool automatically evaluates the website using the System Usability Scale:
- **Score:** 0-100 (higher is better)
- **Adjective:** "poor", "ok", "good", or "excellent"
- **Dimensions:** Learnability, Efficiency, Memorability, Error Prevention, Satisfaction

### Early Stopping

Sessions automatically stop when:
- **Goal reached:** AI decides no more actions needed
- **Low confidence:** AI unsure what to do (confidence < 30%)
- **Website broken:** 2+ consecutive uncertain actions

See [SUS_AND_EARLY_STOPPING.md](SUS_AND_EARLY_STOPPING.md) for complete details.

## How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│         Simulated User (Orchestrator)   │
└─────────────────────────────────────────┘
     ↓          ↓           ↓          ↓
  Browser   Vision API   Heatmap    SUS
Controller Analyzer    Generator  Evaluator
(Playwright)(gpt-6.1-terra)(SVG)  (Scoring)
```

### Session Flow

1. **Browser Launch** – Playwright launches chromium, navigates to target URL
2. **Screenshot** – Full-page screenshot is captured
3. **Vision Analysis** – Screenshot + context sent to gpt-6.1-terra
4. **Action Decision** – gpt-6.1-terra returns:
   - Next action (click, type, scroll, wait, navigate, none)
   - Reasoning for the action
   - Confidence score (0.0-1.0)
   - Attention points (where AI is focusing)
5. **Early Stopping Check** – Verify if conditions met to stop early
6. **Heatmap Generation** – Attention points visualized as SVG overlay
7. **Action Execution** – Browser executes the recommended action
8. **Loop** – Repeat until max iterations or early stop triggered
9. **SUS Evaluation** – At end, AI evaluates website usability on 5 dimensions
10. **Report Generation** – HTML report with all data and visualizations

### Vision Analysis Details

gpt-6.1-terra analyzes:
- **Page layout** – Identifies interactive elements
- **Content** – Reads text and understands context
- **User goal** – Remembers what the user is trying to accomplish
- **History** – Considers previous actions to avoid loops
- **Attention** – Provides focus areas (x/y coordinates, intensity 0-1)

## API Costs

Each iteration costs approximately:
- **Vision API call**: ~$0.01-0.05 USD (depends on image size)
- With default 5 iterations: ~$0.05-0.25 USD per session

Monitor your usage at [platform.openai.com/usage](https://platform.openai.com/usage).

## Troubleshooting

### "OPENAI_API_KEY is required"
- Ensure `OPENAI_API_KEY` is set in `.env` or environment
- Check that the key is valid and not expired

### Browser hangs/timeout
- Increase timeout by setting `waitUntil: 'load'` instead of `'networkidle'`
- Some sites may require additional wait time

### No attention points generated
- Claude may not detect interactive elements
- Try with a different website or check page HTML structure
- The AI will still provide action recommendations even if attention detection fails

### Action not executed
- The browser selector may not match the intended element
- Try specifying more precise descriptions in user prompts
- Check browser console for errors (enable `headless: false`)

## Advanced Usage

### Running with TypeScript directly
```bash
npx ts-node src/main.ts
```

### Building for production
```bash
npm run build  # Compile TypeScript
node dist/main.js  # Run compiled version
```

### Programmatic Usage
```typescript
import { SimulatedUser } from "./src/simulatedUser";

const user = new SimulatedUser({
  targetUrl: "https://example.com",
  apiKey: process.env.OPENAI_API_KEY,
  userGoal: "Find the pricing page",
  maxIterations: 10,
  outputDir: "./results",
});

const session = await user.run();
console.log("Completed iterations:", session.steps.length);
```

## Limitations & Considerations

- ⏱️ **Speed**: Vision API adds ~3-5 seconds per iteration
- 🎯 **Accuracy**: AI might make suboptimal choices on complex UIs
- 📱 **Responsive Design**: Only tests desktop viewport by default
- 🔐 **No Authentication**: Doesn't handle login flows
- 💾 **Session Limits**: Runs until max iterations or AI says "done"

## Future Enhancements

- [ ] Mobile viewport testing
- [ ] Multi-modal interaction (keyboard combinations)
- [ ] Form filling with realistic data
- [ ] Error recovery and retry logic
- [ ] Performance metrics collection
- [ ] Accessibility scanning
- [ ] Video recording of sessions
- [ ] Parallel session execution

## Contributing

Found a bug or have suggestions? Feel free to open an issue or submit a PR.

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review environment variable configuration
3. Ensure Playwright browsers are properly installed: `npx playwright install`
4. Check API key validity at OpenAI dashboard

---

**Made with ❤️ for better web usability testing**
