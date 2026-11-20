# Usage Examples - Simulated User

This file contains practical examples of how to use the Simulated User tool in different scenarios.

## Basic Setup

Before running any example, ensure your `.env` file is set:

```bash
cp .env.example .env
# Edit .env with your OPENAI_API_KEY
```

## Example 1: Simple Website Exploration

**Goal**: Let the AI naturally explore a website without a specific goal.

**.env configuration:**
```env
OPENAI_API_KEY=sk-your-key-here
TARGET_URL=https://example.com
MAX_ITERATIONS=5
```

**Run:**
```bash
npm run dev
```

**What to expect:**
- AI will naturally explore the page
- Take multiple screenshots
- Generate heatmaps showing what it looks at
- Create a report at `output/index.html`

---

## Example 2: Goal-Oriented Testing - E-Commerce

**Goal**: Test if users can find and add products to cart.

**.env configuration:**
```env
OPENAI_API_KEY=sk-your-key-here
TARGET_URL=https://www.samplestore.com
USER_GOAL=Find a blue shirt and add it to the shopping cart
MAX_ITERATIONS=10
```

**Run:**
```bash
npm run dev
```

**Analysis:**
1. Check if AI found the product section
2. Review attention heatmaps to see where it looked
3. See if it successfully added to cart
4. Identify any confusion points (high attention to wrong areas)

---

## Example 3: SaaS Signup Flow

**Goal**: Test the user signup process.

**.env configuration:**
```env
OPENAI_API_KEY=sk-your-key-here
TARGET_URL=https://app.example.com
USER_GOAL=Create a new account with email john@example.com
MAX_ITERATIONS=8
```

**Run:**
```bash
npm run dev
```

**What to analyze:**
- Did the AI find the signup form?
- How many steps did it take?
- What areas got the most attention?
- Were there any confusing UI elements?

---

## Example 4: Documentation Site Navigation

**Goal**: Find specific documentation.

**.env configuration:**
```env
OPENAI_API_KEY=sk-your-key-here
TARGET_URL=https://docs.example.com
USER_GOAL=Find the API authentication documentation
MAX_ITERATIONS=7
```

**Run:**
```bash
npm run dev
```

**Key metrics:**
- Time to find the right section
- Path taken (which links were clicked)
- Attention to search vs navigation menu
- Difficulty finding the content

---

## Example 5: Programmatic Usage

Use the Simulated User class directly in your code:

**File: `custom-test.ts`**
```typescript
import { SimulatedUser } from "./src/simulatedUser";

async function runCustomTest() {
  const user = new SimulatedUser({
    targetUrl: "https://www.example.com",
    apiKey: process.env.OPENAI_API_KEY!,
    userGoal: "Complete the contact form",
    maxIterations: 6,
    outputDir: "./output/contact-form-test",
    headless: false, // See browser UI
  });

  try {
    const session = await user.run();
    
    console.log("Session completed!");
    console.log(`Iterations: ${session.steps.length}`);
    console.log(`Final URL: ${session.steps[session.steps.length - 1].pageUrl}`);
    
    // Analyze the session
    session.steps.forEach((step) => {
      console.log(
        `Step ${step.iteration}: ${step.action.action} ` +
        `(confidence: ${(step.action.confidence * 100).toFixed(1)}%)`
      );
    });
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runCustomTest();
```

**Run:**
```bash
npx ts-node custom-test.ts
```

---

## Example 6: Multiple Tests in Sequence

Test different user goals on the same website:

**File: `batch-test.ts`**
```typescript
import { SimulatedUser } from "./src/simulatedUser";

const targetUrl = "https://www.example.com";
const goals = [
  "Find the pricing page",
  "Sign up for a free trial",
  "Contact customer support",
  "Read the blog",
];

async function runBatchTests() {
  for (const goal of goals) {
    console.log(`\n🎯 Testing goal: ${goal}`);
    
    const user = new SimulatedUser({
      targetUrl,
      apiKey: process.env.OPENAI_API_KEY!,
      userGoal: goal,
      maxIterations: 5,
      outputDir: `./output/batch-${goal.replace(/\s+/g, "-")}`,
    });

    try {
      const session = await user.run();
      console.log(`✅ Completed: ${session.steps.length} iterations`);
    } catch (error) {
      console.log(`❌ Failed: ${error}`);
    }
  }
}

runBatchTests();
```

**Run:**
```bash
npx ts-node batch-test.ts
```

---

## Example 7: Analyzing Results

Extract insights from the generated reports:

**File: `analyze-results.ts`**
```typescript
import fs from "fs";
import path from "path";
import { Session } from "./src/types";

function analyzeSession(sessionPath: string) {
  const session: Session = JSON.parse(
    fs.readFileSync(sessionPath, "utf-8")
  );

  console.log(`\n📊 Analysis: ${session.id}`);
  console.log(`Goal: ${session.userGoal}`);
  console.log(`Steps: ${session.steps.length}`);

  // Find most confident action
  let maxConfidence = 0;
  let mostConfidentStep = null;
  
  session.steps.forEach((step) => {
    if (step.action.confidence > maxConfidence) {
      maxConfidence = step.action.confidence;
      mostConfidentStep = step;
    }
  });

  console.log(
    `Most confident action: ${mostConfidentStep?.action.action} ` +
    `(${(maxConfidence * 100).toFixed(1)}%)`
  );

  // Count action types
  const actionCounts = session.steps.reduce(
    (acc, step) => {
      acc[step.action.action] = (acc[step.action.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log("Action breakdown:");
  Object.entries(actionCounts).forEach(([action, count]) => {
    console.log(`  - ${action}: ${count}`);
  });

  // Average attention points
  const avgAttention = session.steps.reduce((sum, step) => {
    return sum + step.attentionPoints.length;
  }, 0) / session.steps.length;

  console.log(`Average attention points per step: ${avgAttention.toFixed(1)}`);
}

// Analyze the most recent session
const outputDir = "./output";
const latestSession = fs
  .readdirSync(outputDir)
  .filter((f) => f.endsWith("session_report.json"))
  .sort()
  .reverse()[0];

if (latestSession) {
  analyzeSession(path.join(outputDir, latestSession));
}
```

**Run:**
```bash
npx ts-node analyze-results.ts
```

---

## Example 8: Headless vs Visible Browser

Compare behavior with and without seeing the browser:

```bash
# See browser UI - good for debugging
export HEADLESS=false
npm run dev

# Headless - faster, good for CI/CD
export HEADLESS=true
npm run dev
```

---

## Example 9: Different Confidence Thresholds

Stop early if the AI is not confident:

**File: `confidence-threshold.ts`**
```typescript
import { SimulatedUser } from "./src/simulatedUser";

async function smartTest() {
  const user = new SimulatedUser({
    targetUrl: "https://www.example.com",
    apiKey: process.env.OPENAI_API_KEY!,
    userGoal: "Find the API documentation",
    maxIterations: 20, // Allow many iterations
    outputDir: "./output/smart-test",
  });

  // Custom run loop with confidence check
  await user["browserController"].launch();
  
  for (let i = 0; i < 20; i++) {
    // This is a simplified example
    // In real use, you'd modify the SimulatedUser class itself
    console.log(`Iteration ${i + 1}...`);
  }
}
```

---

## Example 10: Mobile Viewport Testing

Test on mobile-sized screens:

**File: `mobile-test.ts`**
```typescript
// Note: Requires modification to browserController.ts
// to add mobile viewport option

import { SimulatedUser } from "./src/simulatedUser";

// Future enhancement example:
const user = new SimulatedUser({
  targetUrl: "https://www.example.com",
  apiKey: process.env.OPENAI_API_KEY!,
  userGoal: "Navigate the mobile menu",
  maxIterations: 5,
  outputDir: "./output/mobile-test",
  // viewport: { width: 375, height: 667 }, // iPhone
});

user.run();
```

---

## Tips for Effective Testing

### 1. **Clear Goals**
Better: `"Find and click the 'Download' button"`  
Worse: `"Navigate the website"`

### 2. **Appropriate Iterations**
- Simple task (find button): 3-5 iterations
- Multi-step flow (checkout): 7-10 iterations
- Complex navigation: 10+ iterations

### 3. **Analyze Heatmaps**
- Look for unexpected attention patterns
- Identify confusing UI elements
- Spot missing call-to-action elements

### 4. **Review Confidence Scores**
- High confidence (>0.8) = clear decision
- Medium (0.5-0.8) = uncertain but reasonable
- Low (<0.5) = confused, possibly wrong path

### 5. **Cost Optimization**
- Start with 5 iterations to test
- Increase only if needed
- Monitor API usage dashboard

---

## Common Issues & Solutions

### "AI keeps clicking the same button"
- Increase `MAX_ITERATIONS` to let it explore more
- Check if goal is achievable on the page
- Review attention points to see what it's focused on

### "Blank screenshots"
- Website may require authentication
- Try a public website first to verify setup
- Check if URL is accessible

### "High API costs"
- Reduce `MAX_ITERATIONS`
- Use smaller, simpler websites for testing
- Batch similar goals together

### "Inconsistent results"
- Results vary because GPT-4 uses temperature
- Run multiple times and average results
- Seed the same user goal for consistency

---

## Next Steps

1. Start with Example 1 (simple exploration)
2. Try Example 2 or 3 (goal-oriented)
3. Review the generated heatmaps
4. Try programmatic usage (Example 5)
5. Automate with batch testing (Example 6)

Happy testing! 🚀
