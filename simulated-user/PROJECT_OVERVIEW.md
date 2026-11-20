# Simulated User - Project Overview

## 🎯 What This Project Does

This is an **AI-powered usability testing tool** that:

1. **Automates user interactions** using Playwright
2. **Makes intelligent decisions** using OpenAI's GPT-4 Vision API
3. **Visualizes attention patterns** with interactive heatmaps
4. **Generates detailed reports** of the entire testing session

Perfect for testing website usability, navigation flows, and user experience.

## 📁 Project Structure

```
simulated-user/
├── src/
│   ├── main.ts                 # Entry point - configure and run
│   ├── types.ts                # TypeScript interfaces
│   ├── simulatedUser.ts        # Main orchestrator class
│   ├── visionAnalyzer.ts       # OpenAI GPT-4 Vision integration
│   ├── browserController.ts    # Playwright browser automation
│   └── heatmapGenerator.ts     # Attention visualization
├── dist/                       # Compiled JavaScript
├── output/                     # Generated reports and screenshots
│   ├── index.html             # Main report
│   ├── heatmap_1.html         # Heatmap for iteration 1
│   ├── screenshot_1.png       # Screenshot from iteration 1
│   ├── heatmap_1.svg          # SVG heatmap overlay
│   └── session_report.json    # Raw session data
├── .env                       # Environment variables (API key, etc.)
├── .env.example               # Template for .env
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── README.md                  # Full documentation
├── QUICKSTART.md              # Quick start guide
├── example.ts                 # Example usage
└── verify.ts                  # Verification script
```

## 🔄 How It Works

### Architecture Diagram

```
┌─────────────────────────────┐
│   Simulated User (Main)     │
└────────────┬────────────────┘
             │
             ├─→ Browser Controller (Playwright)
             │   └─→ Launch browser, navigate, execute actions
             │
             ├─→ Vision Analyzer (OpenAI GPT-4)
             │   └─→ Analyze screenshots, decide next action
             │
             └─→ Heatmap Generator (SVG)
                 └─→ Visualize AI attention points
```

### Session Flow

```
1. Initialize Session
   └─→ Create session ID, track metadata

2. Launch Browser
   └─→ Playwright opens Chromium

3. Navigate to Target URL
   └─→ Browser goes to website

4. Loop (up to MAX_ITERATIONS times):
   a. Take Screenshot
      └─→ Full-page PNG capture
   
   b. Send to GPT-4 Vision
      └─→ Include previous actions for context
      └─→ Include user goal
   
   c. Receive Decision
      ├─→ Next action (click, type, scroll, wait, navigate)
      ├─→ Confidence score
      ├─→ Reasoning
      └─→ Attention points (x, y, intensity)
   
   d. Generate Heatmap
      └─→ SVG overlay with attention circles
   
   e. Execute Action
      └─→ Browser performs the action
      └─→ Wait for page to settle
   
   f. Log Step
      └─→ Save to session

5. Generate Report
   ├─→ Create index.html with timeline
   ├─→ Create individual heatmap HTML files
   └─→ Save session_report.json

6. Close Browser
   └─→ Clean up
```

## 📊 Data Flow

```
User Configuration
       ↓
    .env file ← Environment Variables
       ↓
  SimulatedUser Class
       ├─→ BrowserController
       │   ├─→ Screenshot (PNG)
       │   └─→ Browser State
       │
       ├─→ VisionAnalyzer
       │   ├─→ Send Image + Context to OpenAI
       │   └─→ Receive: Action + Attention Points
       │
       ├─→ HeatmapGenerator
       │   ├─→ Generate SVG Overlay
       │   └─→ Create HTML Visualization
       │
       └─→ Session Manager
           ├─→ Track Steps
           ├─→ Record Actions
           └─→ Build Report

Output
├─→ screenshots/
├─→ heatmaps/
├─→ reports/
└─→ session_report.json
```

## 🔑 Key Components

### 1. **SimulatedUser** (Main Orchestrator)
- Coordinates the entire testing session
- Manages iteration loops
- Generates final reports
- Handles errors and cleanup

### 2. **BrowserController** (Playwright Wrapper)
- Launches and manages browser
- Takes screenshots
- Executes actions (click, type, scroll, etc.)
- Provides page information

### 3. **VisionAnalyzer** (OpenAI Integration)
- Sends screenshots to GPT-4 Vision
- Parses JSON responses
- Extracts decisions and attention points
- Maintains context from previous actions

### 4. **HeatmapGenerator** (Visualization)
- Creates SVG radial gradients for attention areas
- Generates interactive HTML reports
- Overlays attention on screenshots
- Provides visual insight into AI focus

## 🛠️ Technologies Used

- **Playwright** - Browser automation (chromium)
- **OpenAI API** - GPT-4 Vision for image analysis
- **TypeScript** - Type-safe development
- **SVG/HTML** - Report generation

## 📈 Output Files Generated

### HTML Reports
- `index.html` - Main session report with timeline
- `heatmap_N.html` - Individual iteration heatmaps

### Images
- `screenshot_N.png` - Browser screenshots
- `heatmap_N.svg` - SVG overlays with attention circles

### Data
- `session_report.json` - Complete session in JSON

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your OpenAI API key and target URL

# Verify setup
npm run verify

# Run the simulation
npm run dev

# View results
open output/index.html  # macOS
start output/index.html  # Windows
xdg-open output/index.html  # Linux
```

## 💰 Cost Considerations

- **Vision API calls**: ~$0.03-0.08 per iteration
- **Default 5 iterations**: ~$0.15-0.40 per session
- **Depends on**: Image size, model used

Monitor at [platform.openai.com/usage](https://platform.openai.com/usage)

## 🔧 Customization Points

### Modify Vision Analysis
Edit `src/visionAnalyzer.ts`:
- Change the GPT model (currently: `gpt-4-vision`)
- Adjust prompts and instructions
- Modify attention point extraction

### Extend Browser Actions
Edit `src/browserController.ts`:
- Add new action types
- Improve element selection
- Add keyboard shortcuts

### Customize Reports
Edit `src/heatmapGenerator.ts` and `src/simulatedUser.ts`:
- Change HTML styling
- Add new metrics
- Export in different formats

## 📝 Session Report JSON

```json
{
  "id": "uuid",
  "startTime": "ISO timestamp",
  "endTime": "ISO timestamp",
  "targetUrl": "https://example.com",
  "userGoal": "Find pricing page",
  "status": "completed",
  "steps": [
    {
      "iteration": 1,
      "timestamp": "ISO timestamp",
      "screenshotPath": "screenshot_1.png",
      "action": {
        "action": "click",
        "target": "element description",
        "reasoning": "why this action",
        "confidence": 0.92
      },
      "attentionPoints": [
        {
          "x": 50,
          "y": 30,
          "intensity": 0.85,
          "description": "navigation menu"
        }
      ],
      "pageTitle": "Homepage",
      "pageUrl": "https://example.com"
    }
  ]
}
```

## 🔍 Understanding Attention Heatmaps

The heatmaps show:
- **Red circles** - Areas the AI was focused on
- **Circle size** - Indicates the scale of attention
- **Color intensity** - Shows how focused the AI was (0-100%)
- **Labels** - Description of what the AI was looking at

Example interpretation:
- Large, bright red circle over "Buy Now" button → AI was very focused here
- Small, dim red circle over logo → AI noticed it but wasn't focused

## 🎓 Learning Resources

- **OpenAI Vision**: [platform.openai.com/docs/guides/vision](https://platform.openai.com/docs/guides/vision)
- **Playwright**: [playwright.dev](https://playwright.dev)
- **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org)

## 📄 Files Quick Reference

| File | Purpose |
|------|---------|
| `main.ts` | Entry point, configuration |
| `types.ts` | All TypeScript interfaces |
| `simulatedUser.ts` | Main orchestration logic |
| `visionAnalyzer.ts` | OpenAI integration |
| `browserController.ts` | Playwright wrapper |
| `heatmapGenerator.ts` | Report generation |
| `.env` | API keys and configuration |
| `package.json` | Dependencies |

## 🐛 Debugging Tips

1. Set `HEADLESS=false` to see browser UI
2. Check `console.log` output for detailed logs
3. Review `session_report.json` for raw data
4. Inspect browser console in Chrome DevTools
5. Add breakpoints in TypeScript source

## 🚀 Next Steps

1. Try with a simple website first (e.g., example.com)
2. Define a specific user goal
3. Review generated heatmaps to understand AI attention
4. Iterate and refine based on results
5. Integrate into your testing workflow

---

**Happy testing! 🎉**
