#!/usr/bin/env node

/**
 * Example: Testing GitHub homepage usability
 * 
 * This script demonstrates how to run a simulated user on GitHub
 */

import { SimulatedUser } from "./simulatedUser";

async function main() {
  // Example 1: Simple exploration
  console.log("🚀 Starting Simulated User - GitHub Example\n");

  const user = new SimulatedUser({
    targetUrl: "https://github.com",
    apiKey: process.env.OPENAI_API_KEY || "",
    userGoal: "Find the GitHub pricing page",
    maxIterations: 3,
    outputDir: "./output/github-test",
    headless: true,
  });

  try {
    const session = await user.run();

    console.log("\n📊 Session Results:");
    console.log(`  - Total iterations: ${session.steps.length}`);
    console.log(`  - Status: ${session.status}`);
    console.log(`  - Duration: ${new Date(session.endTime!).getTime() - new Date(session.startTime).getTime()}ms`);

    console.log("\n✅ Report generated in ./output/github-test/index.html");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
