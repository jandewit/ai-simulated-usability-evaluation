# System Usability Scale (SUS) & Early Stopping Guide

## Overview

This tool now includes two key features for robust usability testing:

1. **System Usability Scale (SUS) Evaluation** - Automatically evaluates website usability on a 0-100 scale
2. **Early Stopping Mechanism** - Stops testing when success is achieved or when the website appears broken

---

## System Usability Scale (SUS) Evaluation

### What is SUS?

The System Usability Scale (SUS) is a standardized 10-item questionnaire that measures perceived usability. This tool adapts it to AI-driven testing by evaluating five core dimensions:

| Dimension | Description |
|-----------|-------------|
| **Learnability** | How easy is the website to learn? |
| **Efficiency** | Once learned, how quickly can tasks be performed? |
| **Memorability** | If users return later, can they remember how to use it? |
| **Error Prevention** | How well does it prevent errors and aid recovery? |
| **Satisfaction** | Overall, how satisfied would users be? |

### How It Works

After all iterations complete, the AI analyzes:
- Screenshots of the final website state
- The complete history of actions taken
- The user's goal (if provided)
- Patterns in the AI's attention and decisions

It then outputs a single **SUS Score (0-100)** and ratings for each dimension.

### Interpreting SUS Scores

| Score Range | Adjective | Interpretation |
|-------------|-----------|-----------------|
| **0-50** | Poor | Significant usability issues; redesign recommended |
| **50-68** | OK | Acceptable but needs improvement |
| **68-85** | Good | Strong usability; minor improvements possible |
| **85-100** | Excellent | Exceptional usability; best-in-class |

### Example SUS Output

```json
{
  "susEvaluation": {
    "score": 78,
    "adjective": "good",
    "learnability": 85,
    "efficiency": 75,
    "memorability": 80,
    "errors": 70,
    "satisfaction": 75,
    "analysis": "Website has good navigation and intuitive button placement. Minor improvements needed in error messaging and form validation feedback.",
    "timestamp": "2024-01-15T10:30:45.123Z"
  }
}
```

### Where to Find SUS Results

1. **HTML Report** (`index.html`)
   - SUS evaluation displayed prominently with color-coded scores
   - Each dimension rated 0-100
   - Analysis summary from the AI

2. **JSON Report** (`session_report.json`)
   - Complete `susEvaluation` object in session data
   - Machine-readable for analysis and comparison

3. **Console Output**
   - Quick summary during session execution
   - Example: `✅ SUS Score: 78/100 (good)`

---

## Early Stopping Mechanism

### What is MAX_ITERATIONS?

**MAX_ITERATIONS** is a *hard upper limit* on how many actions the AI can take. However, the session may stop *before* reaching this limit due to early stopping conditions.

### Early Stopping Conditions

The session automatically stops when **any** of these occur:

#### 1. **AI Reached End State** (Confidence ✓)
```
Triggers: action.action === "none"
Reason: AI has decided there are no more meaningful actions
Implication: Goal likely achieved or website fully explored
```

#### 2. **AI Confidence Too Low** (Failure)
```
Triggers: action.confidence < 0.3 (30%)
Reason: AI is very uncertain about what to do next
Implication: Website is confusing or broken
```

#### 3. **Repeated Uncertainty** (Failure)
```
Triggers: 2+ consecutive low-confidence actions (< 50%)
Reason: AI keeps making uncertain guesses without clarity
Implication: Website navigation is broken or inaccessible
```

### Configuration Example

```env
# Hard limit: session runs for maximum 10 iterations
MAX_ITERATIONS=10

# Session may stop earlier if:
# - AI reaches end state (usually iteration 3-5)
# - Website breaks (immediate stop at any point)
# - AI gets confused (after 2 uncertain actions)
```

### Example Scenarios

**Scenario 1: Successful Task Completion**
```
Iteration 1: AI navigates to homepage ✓
Iteration 2: AI finds signup button ✓
Iteration 3: AI clicks signup button, form appears ✓
Iteration 4: AI fills form with high confidence ✓
Iteration 5: AI submits form → sees success message
            → AI decides action="none" → SESSION STOPS ✓
            
Status: stopped_early
Reason: AI reached end state (no more actions)
Stopping Condition: Success! Task completed.
```

**Scenario 2: Website Breakdown**
```
Iteration 1: AI sees homepage ✓
Iteration 2: AI clicks button → page doesn't respond
            → AI is confused (confidence 40%) ⚠️
Iteration 3: AI tries clicking something else
            → still confused (confidence 35%) ⚠️
            
Status: stopped_early
Reason: Website appears to be broken or inaccessible (2+ uncertain actions)
Stopping Condition: Failure detected.
```

**Scenario 3: Reaching Max Iterations**
```
Iteration 1-10: AI steadily explores website
            → No end state reached
            → Confidence stays above 50%
            → Reaches iteration limit
            
Status: completed
Stopping Condition: Reached MAX_ITERATIONS limit.
```

### How Confidence Tracking Works

```typescript
// Each action has a confidence score (0.0 - 1.0)
consecutiveFailures = 0  // Reset to 0 when confidence > 50%

If confidence < 50%:
  consecutiveFailures++
  If consecutiveFailures >= 2:
    → STOP SESSION (website likely broken)
Else:
  consecutiveFailures = 0
```

---

## Session Report Structure

### JSON Structure
```json
{
  "id": "uuid",
  "startTime": "2024-01-15T10:30:00.000Z",
  "endTime": "2024-01-15T10:30:45.000Z",
  "targetUrl": "https://example.com",
  "userGoal": "Sign up for newsletter",
  "steps": [
    {
      "iteration": 1,
      "timestamp": "2024-01-15T10:30:05.000Z",
      "action": {
        "action": "click",
        "target": "sign up button",
        "confidence": 0.95,
        "reasoning": "Visible call-to-action button"
      },
      "attentionPoints": [...]
    }
  ],
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
    "analysis": "Website has good navigation...",
    "timestamp": "2024-01-15T10:30:45.000Z"
  }
}
```

### Session Status Values

| Status | Meaning |
|--------|---------|
| `completed` | Reached MAX_ITERATIONS without early stop |
| `stopped_early` | Stopped before MAX_ITERATIONS (success or failure) |
| `failed` | Critical error occurred (crash, network failure) |
| `active` | Session still running |

---

## Best Practices

### 1. Set Appropriate MAX_ITERATIONS
```env
# For quick tests: 3-5 iterations
MAX_ITERATIONS=5

# For thorough exploration: 8-15 iterations
MAX_ITERATIONS=15

# Note: Early stopping means you typically won't use all iterations
```

### 2. Provide Clear User Goals
```env
# Good: Specific, measurable
USER_GOAL=Find and click the "Sign Up" button

# Better: Include expected outcome
USER_GOAL=Navigate to pricing page and click "Start Free Trial"

# Note: If no goal provided, AI explores naturally
```

### 3. Interpret SUS Scores in Context
```
Score: 65 (OK)
- If targeting general audiences: "Needs improvement"
- If targeting power users: "Acceptable"
- Context matters! Compare against industry benchmarks (average SUS = 68)
```

### 4. Analyze Early Stopping Reasons
```
If frequently stopping due to low confidence:
  → Website navigation unclear
  → Buttons/links not obvious
  → Forms confusing or broken

If always reaching end state quickly:
  → Website is easy to use ✓
  → May need longer tests for complex workflows
  → Consider providing more complex USER_GOAL
```

### 5. Monitor Consecutive Runs
```
Run 1: SUS 72, stopped early (success)
Run 2: SUS 70, stopped early (success)
Run 3: SUS 68, stopped early (success)
→ Consistent usability: Good sign

Run 1: SUS 55, stopped early (failure)
Run 2: SUS 42, stopped early (failure)  
Run 3: SUS 65, stopped early (success)
→ Inconsistent usability: Investigate
```

---

## Console Output Examples

### Successful Session with SUS
```
🚀 Starting simulated user session: 550e8400-e29b-41d4-a716-446655440000
📍 Target URL: https://example.com
🎯 User Goal: Sign up for newsletter

📸 Iteration 1/5
✅ Action: click - Found and clicked signup button
📌 Attention points: 3 focus areas detected

📸 Iteration 2/5
✅ Action: type - Entering email address
📌 Attention points: 2 focus areas detected

📸 Iteration 3/5
⏹️  Early stopping: AI reached end state (no more actions)

📊 Evaluating website usability with System Usability Scale...
✅ SUS Score: 78/100 (good)

✨ Session completed: 550e8400-e29b-41d4-a716-446655440000
📊 Output directory: ./output
```

### Failed Session with Early Stop
```
📸 Iteration 2/5
✅ Action: scroll - Scrolling page
📌 Attention points: 2 focus areas detected

📸 Iteration 3/5
✅ Action: click - Clicking potential button
📌 Attention points: 1 focus areas detected

⏹️  Early stopping: Website appears to be broken or inaccessible (2+ uncertain actions)

📊 Evaluating website usability with System Usability Scale...
✅ SUS Score: 42/100 (poor)

✨ Session completed: 550e8400-e29b-41d4-a716-446655440000
📊 Output directory: ./output
```

---

## Troubleshooting

### "SUS evaluation failed" Warning
**Cause:** OpenAI API error during evaluation  
**Solution:** 
- Check API key validity
- Verify rate limits not exceeded
- SUS is optional; session still completes

### Session stops immediately
**Cause:** Website is inaccessible or broken  
**Solution:**
- Verify TARGET_URL is correct
- Check website is not in maintenance mode
- Ensure network connectivity

### Always reaching "stopped_early: AI confidence too low"
**Cause:** Website UI is unclear or broken  
**Solution:**
- Check website rendering in normal browser
- Ensure all buttons/links are properly visible
- Run with longer MAX_ITERATIONS for more data
- Review screenshot files in output directory

### SUS score seems inconsistent
**Cause:** AI reasoning varies; some randomness is normal  
**Solution:**
- Run multiple sessions and average scores
- SUS is based on AI's visual analysis, not standardized questions
- Compare scores across sessions of same website for trends

---

## Technical Details

### SUS Evaluation Model
- **Model:** gpt-6.1-terra (specialized visual reasoning)
- **Timing:** Runs after all iterations complete
- **Input:** Final screenshot + step history
- **Output:** Score (0-100) + 5 dimension ratings

### Early Stopping Implementation
- **Tracked in:** `SimulatedUser.consecutiveFailures` counter
- **Reset by:** Successful action (confidence > 50%)
- **Threshold:** 2 consecutive failures triggers stop
- **Logged:** `stoppingReason` field in session report

---

## Next Steps

1. **Run a test** with `USER_GOAL` defined
2. **Check output/index.html** for SUS visualization
3. **Review session_report.json** for detailed metrics
4. **Compare multiple runs** to identify patterns
5. **Iterate on website** based on feedback

Happy testing! 🚀
