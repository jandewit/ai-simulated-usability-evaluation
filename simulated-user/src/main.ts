import "dotenv/config.js";
import { SimulatedUser } from "./simulatedUser.js";

// Configuration
const config = {
  targetUrl: process.env.TARGET_URL || "https://example.com",
  apiKey: process.env.OPENAI_API_KEY || "",
  userGoal: process.env.USER_GOAL,
  maxIterations: parseInt(process.env.MAX_ITERATIONS || "5"),
  outputDir: process.env.OUTPUT_DIR || "./output",
  headless: process.env.HEADLESS !== "false",
  testData: {
    email: process.env.TEST_EMAIL || "test@example.com",
    firstName: process.env.TEST_FIRST_NAME || "John",
    lastName: process.env.TEST_LAST_NAME || "Doe",
    phone: process.env.TEST_PHONE || "555-0123",
    streetAddress: process.env.TEST_STREET || "123 Main Street",
    city: process.env.TEST_CITY || "Springfield",
    state: process.env.TEST_STATE || "IL",
    postalCode: process.env.TEST_POSTAL || "62701",
    country: process.env.TEST_COUNTRY || "United States",
    cardNumber: process.env.TEST_CARD_NUMBER || "4111111111111111",
    cardExpiry: process.env.TEST_CARD_EXPIRY || "12/25",
    cardCvc: process.env.TEST_CARD_CVC || "123",
  },
};

// Validate required config
if (!config.apiKey) {
  console.error("❌ Error: OPENAI_API_KEY environment variable is required");
  process.exit(1);
}

if (!config.targetUrl || config.targetUrl === "https://example.com") {
  console.error("❌ Error: TARGET_URL environment variable is required");
  process.exit(1);
}

// Run the simulated user
const user = new SimulatedUser(config);
user
  .run()
  .then((session) => {
    console.log("\n✅ Session completed successfully!");
    console.log(`📊 Open ./output/index.html to view the full report`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
