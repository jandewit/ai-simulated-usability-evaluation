#!/usr/bin/env node

/**
 * Verification script - Checks that all components are properly installed
 */

import fs from "fs";
import path from "path";

const checks = [
  {
    name: "Node.js",
    test: () => process.version,
  },
  {
    name: "node_modules installed",
    test: () => fs.existsSync("node_modules"),
  },
  {
    name: "OpenAI package",
    test: () => {
      try {
        require.resolve("openai");
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: "Playwright package",
    test: () => {
      try {
        require.resolve("playwright");
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: ".env file",
    test: () => fs.existsSync(".env"),
  },
  {
    name: "OPENAI_API_KEY set",
    test: () => !!process.env.OPENAI_API_KEY,
  },
  {
    name: "TARGET_URL set",
    test: () => !!process.env.TARGET_URL,
  },
  {
    name: "TypeScript compiled",
    test: () => fs.existsSync("dist/main.js"),
  },
];

console.log("🔍 Simulated User - Verification Check\n");

let passed = 0;
let failed = 0;

checks.forEach((check) => {
  try {
    const result = check.test();
    if (result) {
      console.log(`✅ ${check.name}`);
      passed++;
    } else {
      console.log(`❌ ${check.name}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${check.name}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log(
    "\n✨ Everything looks good! Run 'npm run dev' to start testing."
  );
  process.exit(0);
} else {
  console.log(
    "\n⚠️  Some checks failed. Please review the QUICKSTART.md guide."
  );
  if (!process.env.OPENAI_API_KEY) {
    console.log("   - Set OPENAI_API_KEY in .env file");
  }
  if (!process.env.TARGET_URL) {
    console.log("   - Set TARGET_URL in .env file");
  }
  process.exit(1);
}
