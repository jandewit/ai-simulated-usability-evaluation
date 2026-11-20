# System Usability Scale (SUS) & Early Stopping Features

## ✨ What's New

Your AI usability testing tool now includes two powerful new features:

### 1. 📊 System Usability Scale (SUS) Evaluation
Automatically measures website usability on a **0-100 scale** after every test.

**What you get:**
- Overall SUS score (0-100)
- Five dimension ratings (Learnability, Efficiency, Memorability, Error Prevention, Satisfaction)
- AI-generated analysis of usability strengths and weaknesses
- Adjective rating (poor/ok/good/excellent)
- Timestamp for tracking changes over time

**Example output:**
```
SUS Score: 78/100 (Good)
├─ Learnability: 85
├─ Efficiency: 75
├─ Memorability: 80
├─ Error Prevention: 70
└─ Satisfaction: 75

Analysis: "Website has good navigation and intuitive button placement..."
```

### 2. ⏹️ Smart Early Stopping
Sessions automatically stop when appropriate, **before reaching MAX_ITERATIONS**.

**Stop conditions:**
- ✅ **Success:** AI decides goal is achieved (no more actions needed)
- ⚠️ **Low Confidence:** AI unsure how to proceed (< 30% confidence)
- ❌ **Website Broken:** 2+ consecutive low-confidence actions (< 50%)

**Benefits:**
- Saves time and API costs
- Prevents wasted iterations on broken websites
- Clearly identifies when goals are achieved

## 🎯 How to Use

### Basic Usage
```bash
export OPENAI_API_KEY="sk-your-key"
export TARGET_URL="https://example.com"
export USER_GOAL="Sign up for account"
npm run dev
```

### Reading Results

**In HTML Report (output/index.html):**
1. Look for the **SUS Score Card** at the top
2. See all 5 dimensions with their ratings
3. Read the AI analysis for details
4. Check the status and stopping reason

**In JSON Report (output/session_report.json):**
```json
{
  "status": "stopped_early",
  "stoppingReason": "AI reached end state (no more actions)",
  "susEvaluation": {
    "score": 78,
    "adjective": "good",
    "learnability": 85,
    "efficiency": 75,
    "memorability": 80,
    "errors": 70,
    "satisfaction": 75,
    "analysis": "Website has good navigation..."
  }
}
```

## 📈 Understanding SUS Scores

| Score | Rating | What It Means |
|-------|--------|---------------|
| **85-100** | Excellent | World-class usability - best of the best |
| **68-84** | Good | Strong usability - most users will be satisfied |
| **50-67** | OK | Acceptable but needs improvement |
| **Below 50** | Poor | Significant issues - redesign recommended |

**Industry Benchmark:** Average SUS score = 68

## 🛑 Understanding Early Stopping

### When Sessions Stop Early (Before MAX_ITERATIONS)

#### Reason 1: "AI reached end state"
```
✅ What it means: Goal completed successfully
📊 SUS will likely be: Good/Excellent (68+)
🎯 What to do: Review what made the website work well
```

Example:
```
Iteration 1: Navigated to homepage
Iteration 2: Found signup button
Iteration 3: Filled and submitted form
            → AI sees success message
            → Decides: "No more actions needed"
            → Session stops ✓
```

#### Reason 2: "AI confidence too low"
```
⚠️ What it means: Website is confusing or broken
📊 SUS will likely be: Poor/OK (below 68)
🎯 What to do: Check website rendering and UI clarity
```

Example:
```
Iteration 1: Navigated to homepage
Iteration 2: Tried to click button → AI unsure if it worked
            → Confidence: 25% (too low)
            → Session stops ⚠️
```

#### Reason 3: "Website appears broken"
```
❌ What it means: Multiple failed attempts to understand page
📊 SUS will likely be: Poor (below 50)
🎯 What to do: Inspect website for errors, broken links
```

Example:
```
Iteration 1: Navigated to homepage
Iteration 2: Tried clicking → confused (40% confidence)
Iteration 3: Tried scrolling → still confused (45% confidence)
            → 2 consecutive failures
            → Session stops ❌
```

### When Sessions Reach MAX_ITERATIONS

If your session reaches MAX_ITERATIONS without early stopping:
- AI is steadily progressing (confidence > 50%)
- No clear end state detected
- Status: `completed` (not `stopped_early`)
- Likely reason: Website has complex workflows or AI exploring naturally

## 🔧 Configuration

### Set Longer Sessions
```bash
# More iterations for complex workflows
export MAX_ITERATIONS=15

# Note: Session may still stop early due to conditions above
```

### Provide Clear Goals
```bash
# Good: Specific, measurable
export USER_GOAL="Add a blue shirt to cart"

# Less specific: AI explores more
export USER_GOAL="Browse products"

# No goal: AI explores naturally
# (omit USER_GOAL entirely)
```

### View Browser During Testing
```bash
# See the browser as it's tested
export HEADLESS=false
npm run dev

# (Useful for debugging)
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **README.md** | Overview and quick start |
| **SUS_AND_EARLY_STOPPING.md** | Complete detailed guide |
| **QUICK_REFERENCE.md** | Fast lookup tables |
| **CHANGELOG.md** | What changed in v2.0 |

## 🚀 Examples

### Example 1: E-commerce Site
```bash
export TARGET_URL="https://shop.example.com"
export USER_GOAL="Add a product to cart"
npm run dev
```

**Expected Result:**
- SUS Score: 70-85 (depends on UI clarity)
- Stopped early: "AI reached end state" (after 2-4 iterations)
- Fast, efficient test

### Example 2: Complex Dashboard
```bash
export TARGET_URL="https://app.example.com/dashboard"
export USER_GOAL="Create a new project"
export MAX_ITERATIONS=15
npm run dev
```

**Expected Result:**
- SUS Score: 50-80 (depends on complexity)
- May reach MAX_ITERATIONS or stop early
- Slower test (more interactions)

### Example 3: Broken Website
```bash
export TARGET_URL="https://broken.example.com"
npm run dev
```

**Expected Result:**
- SUS Score: Below 50 (poor)
- Stopped early: "Website appears broken" (1-2 iterations)
- Quickly identifies issues

## ❓ FAQs

**Q: Why did my session stop at iteration 3 when MAX_ITERATIONS=10?**
A: The AI likely reached end state or low confidence. This is normal and expected. Check the `stoppingReason` in the report.

**Q: Is a SUS score of 65 good or bad?**
A: It's right in the middle ("OK"). Industry average is 68, so 65 is slightly below average. Needs improvement.

**Q: What if SUS evaluation fails?**
A: You'll see a warning, but the session still completes. The error is usually API-related and doesn't affect other results.

**Q: Can I turn off early stopping?**
A: Not directly, but you can set MAX_ITERATIONS to 1 and check results. Early stopping is designed to improve efficiency.

**Q: How do I compare websites using SUS?**
A: Run both sites 3+ times each, average the scores, and compare. Higher score = better usability.

## 🎓 Best Practices

✅ **DO:**
- Provide clear, specific USER_GOAL
- Run each website 3+ times for consistency
- Compare SUS scores across versions
- Use longer MAX_ITERATIONS for complex workflows
- Review AI analysis, not just the number

❌ **DON'T:**
- Rely on a single test run
- Expect SUS to be perfect (68+ is good)
- Ignore websites with low SUS (investigate why)
- Test offline or broken websites
- Use HEADLESS=false in production

## 📊 Analyzing Trends

**Single run:**
```
Website A: SUS 72
Website B: SUS 65
→ Website A is better
```

**Multiple runs (better approach):**
```
Website A: 72, 70, 75 → Average: 72.3 ✓
Website B: 65, 68, 64 → Average: 65.7
→ Website A is significantly better
```

## 🔍 Troubleshooting

### "API key invalid" error
- Check `.env` file has correct OPENAI_API_KEY
- Verify API key is active in OpenAI dashboard

### Session stops immediately
- Check TARGET_URL is accessible
- Try opening URL in browser manually
- Verify website is not in maintenance mode

### "Website appears broken" on working site
- Increase MAX_ITERATIONS to 20
- Try different USER_GOAL
- Check website rendering in headless Chrome

### Inconsistent SUS scores
- This is normal! Run 5+ times and average
- Each run uses slightly different reasoning
- Scores within ±5 of average are consistent

## 📞 Support

For detailed information, see:
- **SUS_AND_EARLY_STOPPING.md** – Complete technical guide
- **PROJECT_OVERVIEW.md** – Architecture and design
- **QUICKSTART.md** – Step-by-step setup

---

**Version:** 2.0.0  
**Last Updated:** 2024-01-15  
**Status:** ✅ Fully Implemented and Tested
