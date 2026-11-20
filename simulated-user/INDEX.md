# 📚 Documentation Index

Welcome to the Simulated User documentation! Here's where to find what you need.

## 🚀 Getting Started (Start Here!)

**New to this project?** Start with these in order:

1. **[SETUP.md](./SETUP.md)** - ⚡ 10-minute setup guide
   - Installation steps
   - Configuration
   - First test run
   - **Start here if you're new!**

2. **[QUICKSTART.md](./QUICKSTART.md)** - 📋 Quick reference
   - Common commands
   - Configuration options
   - Basic troubleshooting
   - **Quick reference while using**

3. **[README.md](./README.md)** - 📖 Full documentation
   - Feature overview
   - Installation details
   - API reference
   - Advanced configuration
   - **Complete reference guide**

## ✨ What's New in v2.0

### 📊 System Usability Scale (SUS) Evaluation
- Automatic website usability scoring (0-100)
- Five-dimension evaluation
- AI-generated analysis
- See [FEATURES_SUS_AND_STOPPING.md](./FEATURES_SUS_AND_STOPPING.md) for details

### ⏹️ Smart Early Stopping
- Stop sessions when success reached
- Detect broken websites automatically
- Save time and API costs
- See [SUS_AND_EARLY_STOPPING.md](./SUS_AND_EARLY_STOPPING.md) for details

👉 **New Users**: Start with [FEATURES_SUS_AND_STOPPING.md](./FEATURES_SUS_AND_STOPPING.md) for an overview!

## 🎓 Learning & Understanding

### If you want to understand the project:
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - 🏗️ Architecture & design
  - How everything works
  - Component descriptions
  - Data flow diagrams
  - Technology choices

### If you want to see examples:
- **[EXAMPLES.md](./EXAMPLES.md)** - 💡 Practical usage examples
  - 10+ real-world scenarios
  - E-commerce testing
  - SaaS signup testing
  - Batch testing
  - Custom analysis

### If you want to know what's available:
- **[FEATURES.md](./FEATURES.md)** - ✨ Feature checklist
  - What's implemented
  - What's planned
  - Performance metrics
  - Quality metrics

### If you want to know what changed:
- **[CHANGELOG.md](./CHANGELOG.md)** - 📝 Version history
  - New features in v2.0
  - Breaking changes (none!)
  - Migration guide
  - Technical details

## 🔍 SUS & Early Stopping Documentation

### Official SUS Questionnaire
- **[SUS_QUESTIONNAIRE.md](./SUS_QUESTIONNAIRE.md)** - 📋 **NEW!** Official 10-item questionnaire
  - All 10 validated questions
  - Detailed explanation of each question
  - Official SUS scoring formula
  - Score interpretation guide
  - Benchmarking data
  - **Essential reading for SUS understanding!**

### Quick Overview
- **[FEATURES_SUS_AND_STOPPING.md](./FEATURES_SUS_AND_STOPPING.md)** - 📊 User-friendly feature guide
  - What you get
  - How to use
  - Understanding scores
  - Common questions
  - **Start here for these features!**

### Complete Technical Guide
- **[SUS_AND_EARLY_STOPPING.md](./SUS_AND_EARLY_STOPPING.md)** - 🔧 Detailed technical guide
  - How SUS works
  - Early stopping mechanics
  - Configuration examples
  - Troubleshooting
  - Best practices
  - **Deep dive guide**

### Quick Reference
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - ⚡ One-page cheatsheet
  - Common commands
  - Score interpretation
  - Stopping reasons
  - Configuration quick tips
  - **Quick lookup while using**

## 🔧 Configuration

### Environment Variables
See **[SETUP.md - Step 4](./SETUP.md#step-4-create-env-file-1-minute)** or **.env.example**

Key variables:
- `OPENAI_API_KEY` - Your OpenAI API key
- `TARGET_URL` - Website to test
- `USER_GOAL` - What the AI should try to do
- `MAX_ITERATIONS` - How many steps to run (may stop early!)
- `OUTPUT_DIR` - Where to save results
- `HEADLESS` - Browser visibility

**New in v2.0:** MAX_ITERATIONS is now a "hard limit" with early stopping conditions.

## 📊 Using the Tool

### Basic Usage
```bash
npm run dev
```

See **[QUICKSTART.md](./QUICKSTART.md#quick-start)** for details.

### Programmatic Usage
```typescript
import { SimulatedUser } from "./src/simulatedUser";
const user = new SimulatedUser(config);
const session = await user.run();
console.log(`SUS Score: ${session.susEvaluation.score}`);
```

See **[EXAMPLES.md - Example 5](./EXAMPLES.md#example-5-programmatic-usage)**.

### Batch Testing
Test multiple scenarios:

See **[EXAMPLES.md - Example 6](./EXAMPLES.md#example-6-multiple-tests-in-sequence)**.

## 🐛 Troubleshooting

### Common Issues

| Problem | Solution | Link |
|---------|----------|------|
| "OPENAI_API_KEY is required" | Add API key to .env | [SETUP.md](./SETUP.md#step-4-create-env-file-1-minute) |
| API key not working | Verify key at platform.openai.com | [README.md](./README.md#troubleshooting) |
| Browser won't open | Set HEADLESS=false | [QUICKSTART.md](./QUICKSTART.md#troubleshooting) |
| SUS evaluation failed | Usually API-related, session continues | [SUS_AND_EARLY_STOPPING.md](./SUS_AND_EARLY_STOPPING.md#troubleshooting) |
| Always stopping early | Website may be broken, check screenshots | [FEATURES_SUS_AND_STOPPING.md](./FEATURES_SUS_AND_STOPPING.md#troubleshooting) |
| High costs | Reduce MAX_ITERATIONS or improve USER_GOAL | [README.md](./README.md#api-costs) |

**Full troubleshooting:**
- [SETUP.md - Troubleshooting](./SETUP.md#troubleshooting)
- [QUICKSTART.md - Troubleshooting](./QUICKSTART.md#troubleshooting)
- [SUS_AND_EARLY_STOPPING.md - Troubleshooting](./SUS_AND_EARLY_STOPPING.md#troubleshooting)
- [README.md - Troubleshooting](./README.md#troubleshooting)

## 📁 Project Files

### Source Code (`src/`)
- `main.ts` - Entry point
- `simulatedUser.ts` - Main orchestrator (handles SUS + early stopping)
- `visionAnalyzer.ts` - OpenAI integration
- `susEvaluator.ts` - **NEW** SUS scoring
- `browserController.ts` - Playwright wrapper
- `heatmapGenerator.ts` - Visualization
- `types.ts` - TypeScript interfaces

### Configuration
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `.env.example` - Environment template (updated for v2.0)
- `.gitignore` - Git settings

### Scripts
- `src/main.ts` - Main entry (`npm run dev`)
- `example.ts` - Example usage (`npm run example`)
- `verify.ts` - Setup verification (`npm run verify`)

## 🎯 Common Tasks

### I want to test a website and see SUS score
1. Read [SETUP.md](./SETUP.md)
2. Configure .env
3. Run `npm run dev`
4. Open generated `output/index.html`
5. Look for SUS Score Card at top

### I want to understand SUS evaluation
1. Read [FEATURES_SUS_AND_STOPPING.md](./FEATURES_SUS_AND_STOPPING.md) (quick overview)
2. Read [SUS_AND_EARLY_STOPPING.md](./SUS_AND_EARLY_STOPPING.md) (detailed guide)

### I want to understand early stopping
1. Read [FEATURES_SUS_AND_STOPPING.md](./FEATURES_SUS_AND_STOPPING.md) - Early Stopping section
2. See real examples in [SUS_AND_EARLY_STOPPING.md](./SUS_AND_EARLY_STOPPING.md)

### I want to understand how it works
1. Read [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
2. Look at code in `src/`
3. Review [FEATURES.md](./FEATURES.md)

### I want to see code examples
1. Check [EXAMPLES.md](./EXAMPLES.md)
2. Look at `example.ts`
3. Look at comments in `src/` files

### I want to customize behavior
1. Read [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Architecture
2. Modify relevant `src/` file
3. Read comments and types for guidance
4. Test with `npm run dev`

### I want to integrate into my project
1. Read [EXAMPLES.md - Example 5](./EXAMPLES.md#example-5-programmatic-usage)
2. Import `SimulatedUser` class
3. Create config object
4. Call `await user.run()`
5. Access `session.susEvaluation` for SUS results

### I want to batch test multiple sites
1. Read [EXAMPLES.md - Example 6](./EXAMPLES.md#example-6-multiple-tests-in-sequence)
2. Create array of configurations
3. Loop and run for each
4. Compare SUS scores across runs

### I want to analyze the results
1. Check generated `output/index.html` - includes SUS evaluation
2. Review `output/heatmap_N.html` files
3. Parse `output/session_report.json` - includes `susEvaluation`
4. See [EXAMPLES.md - Example 7](./EXAMPLES.md#example-7-analyzing-results)

## 📖 Reading Order

### For Quick Start (15 minutes)
1. [SETUP.md](./SETUP.md) - 10 min
2. Run `npm run dev` - 2 min
3. View results - 3 min

### For SUS & Early Stopping (30 minutes)
1. [FEATURES_SUS_AND_STOPPING.md](./FEATURES_SUS_AND_STOPPING.md) - 15 min
2. Run multiple tests - 10 min
3. Compare results - 5 min

### For Full Understanding (45 minutes)
1. [SETUP.md](./SETUP.md) - 10 min
2. [README.md](./README.md) - 20 min
3. [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - 15 min

### For Examples & Advanced Use (1 hour)
1. [EXAMPLES.md](./EXAMPLES.md) - 30 min
2. [README.md - Advanced Usage](./README.md#advanced-usage) - 15 min
3. Experiment with code - 15 min

### For Complete Mastery (2+ hours)
1. Read all documentation
2. Study source code in `src/`
3. Create custom modifications
4. Write custom analysis scripts

## 🔗 Quick Links

**Documentation:**
- [README.md](./README.md) - Full documentation
- [SETUP.md](./SETUP.md) - Setup guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - One-page cheatsheet
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Architecture
- [EXAMPLES.md](./EXAMPLES.md) - Usage examples
- [FEATURES.md](./FEATURES.md) - Feature list
- [FEATURES_SUS_AND_STOPPING.md](./FEATURES_SUS_AND_STOPPING.md) - **NEW** SUS guide
- [SUS_AND_EARLY_STOPPING.md](./SUS_AND_EARLY_STOPPING.md) - **NEW** Technical guide
- [CHANGELOG.md](./CHANGELOG.md) - **NEW** Version history

**External Resources:**
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Playwright Documentation](https://playwright.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

**In-Project Resources:**
- [.env.example](./.env.example) - Configuration template
- [package.json](./package.json) - Dependencies
- [src/](./src/) - Source code

## 💬 Getting Help

### Setup Issues
→ See [SETUP.md - Troubleshooting](./SETUP.md#troubleshooting)

### Running Issues
→ See [QUICKSTART.md - Troubleshooting](./QUICKSTART.md#troubleshooting)

### SUS & Early Stopping Issues
→ See [SUS_AND_EARLY_STOPPING.md - Troubleshooting](./SUS_AND_EARLY_STOPPING.md#troubleshooting)

### Understanding the Tool
→ See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

### Usage Examples
→ See [EXAMPLES.md](./EXAMPLES.md)

### API/Code Reference
→ See source files in [src/](./src/)

### Feature Questions
→ See [FEATURES.md](./FEATURES.md)

### What's New?
→ See [CHANGELOG.md](./CHANGELOG.md)

## 🎓 Learning Path

**Beginner** (just want to run it)
```
SETUP.md → Run tool → Check SUS results → Done!
```

**Intermediate** (want to understand SUS)
```
SETUP.md → FEATURES_SUS_AND_STOPPING.md → Run tests → Compare scores
```

**Advanced** (want to master it)
```
All docs → Source code → Write custom analysis → Integrate into workflow
```

## 📝 File Guide

| File | Size | Purpose |
|------|------|---------|
| README.md | 7.5KB | Complete reference |
| SETUP.md | 7.7KB | Setup guide |
| QUICKSTART.md | 4.4KB | Quick reference |
| QUICK_REFERENCE.md | 3.7KB | One-page cheatsheet |
| PROJECT_OVERVIEW.md | 9.0KB | Architecture |
| EXAMPLES.md | 9.7KB | Code examples |
| FEATURES.md | 7.7KB | Feature checklist |
| **SUS_QUESTIONNAIRE.md** | 10.4KB | **NEW** Official 10-item SUS |
| **FEATURES_SUS_AND_STOPPING.md** | 8.6KB | SUS user guide |
| **SUS_AND_EARLY_STOPPING.md** | 11.4KB | Technical guide |
| **CHANGELOG.md** | 7.3KB | **NEW** Version history |
| SOURCE CODE | 22KB | Actual implementation |

## ✅ Verification Checklist

Have you:
- [ ] Read [SETUP.md](./SETUP.md)?
- [ ] Created .env file?
- [ ] Run `npm install`?
- [ ] Run `npm run verify`?
- [ ] Run `npm run dev` at least once?
- [ ] Opened `output/index.html` in browser?
- [ ] Checked the SUS Score Card?
- [ ] Reviewed the stopping reason?

If yes to all: ✨ **You're ready to go!**

## 🚀 Next Steps

1. **Immediate**: Run `npm run dev` and view results with SUS score
2. **Soon**: Try different websites and goals, compare SUS scores
3. **Next**: Read [FEATURES_SUS_AND_STOPPING.md](./FEATURES_SUS_AND_STOPPING.md) to understand scoring
4. **Later**: Integrate into your workflow using [EXAMPLES.md](./EXAMPLES.md)

---

## Document Information

- **Last Updated**: 2024-01-15
- **Version**: 2.0.0
- **Status**: ✅ Production Ready
- **New Features**: SUS Evaluation, Smart Early Stopping

For the latest information, check the individual documentation files.

**Happy testing! 🤖📊**
