# Quick Reference Guide

## Run a Test

```bash
export OPENAI_API_KEY="sk-your-key"
export TARGET_URL="https://example.com"
export USER_GOAL="Sign up for account"
npm run dev
```

## Understanding Results

### In HTML Report (output/index.html)

**SUS Score Card** (top of page)
- 🎯 Overall score: 0-100
- 📊 Five dimension ratings
- 📝 AI analysis of usability

**Timeline Table** (bottom)
- Each action the AI took
- Confidence % for each action
- Link to visualization heatmap

**Status** (top right)
- `completed` = Reached MAX_ITERATIONS
- `stopped_early` = Ended before limit (success or failure)
- `failed` = Error occurred

### In JSON Report (output/session_report.json)

```json
{
  "status": "stopped_early",
  "stoppingReason": "AI reached end state",
  "susEvaluation": {
    "score": 78,
    "adjective": "good",
    "analysis": "..."
  }
}
```

## SUS Score Interpretation

| Score | Rating | Meaning |
|-------|--------|---------|
| 85-100 | Excellent | Best-in-class usability |
| 68-84 | Good | Strong usability |
| 50-67 | OK | Acceptable, needs improvement |
| Below 50 | Poor | Significant issues, redesign needed |

## Early Stopping Reasons

| Reason | Implication |
|--------|-------------|
| "AI reached end state" | ✓ Goal likely completed |
| "AI confidence too low" | ✗ Website too confusing |
| "Website appears broken" | ✗ Navigation/UI broken |
| Reached MAX_ITERATIONS | ⚠️ Normal completion |

## Configuration

**Increase exploration time:**
```bash
export MAX_ITERATIONS=15
```

**Provide specific goal:**
```bash
export USER_GOAL="Add item to cart"
```

**Show browser (non-headless):**
```bash
export HEADLESS=false
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "API key invalid" | Check OPENAI_API_KEY in .env |
| Stops immediately | Check TARGET_URL is accessible |
| "No JSON found" | Website may be breaking AI parsing |
| Always low SUS score | Website may need UI improvements |

## Files Generated

```
output/
├── index.html              ← Open this in browser
├── session_report.json     ← Machine-readable results
├── screenshot_1.png        ← Full page screenshots
├── heatmap_1.html          ← Interactive attention maps
└── heatmap_1.svg           ← SVG heat overlays
```

## Running Multiple Tests

Compare website versions:

```bash
# Test version A
export TARGET_URL="https://example-v1.com"
npm run dev
mv output output_v1

# Test version B
export TARGET_URL="https://example-v2.com"
npm run dev
mv output output_v2

# Compare SUS scores in both reports
```

## SUS Dimensions

1. **Learnability** – Easy to understand initially?
2. **Efficiency** – Quick to accomplish tasks?
3. **Memorability** – Easy to remember next time?
4. **Error Prevention** – Prevents mistakes & aids recovery?
5. **Satisfaction** – Overall user satisfaction?

## Tips

✅ **DO:**
- Provide clear USER_GOAL
- Test multiple times for consistency
- Compare against baseline (industry avg SUS = 68)
- Use longer MAX_ITERATIONS for complex workflows

❌ **DON'T:**
- Run with HEADLESS=false unless debugging
- Test broken/offline websites (expected to fail)
- Ignore low SUS scores (investigate root cause)
- Rely on single test run (run 3+ times)

## Documentation

- 📖 **SUS_AND_EARLY_STOPPING.md** – Complete feature guide
- 🚀 **QUICKSTART.md** – Step-by-step setup
- 🏗️ **PROJECT_OVERVIEW.md** – Architecture details
- 📊 **FEATURES.md** – Full feature list

---

**Need help?** See the full documentation files above or check console output during run.
