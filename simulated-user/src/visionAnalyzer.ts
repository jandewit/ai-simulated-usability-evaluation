import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { ActionDecision, AttentionPoint, TestData } from "./types.js";

export class VisionAnalyzer {
  private client: OpenAI;
  private testData?: TestData;

  constructor(apiKey: string, testData?: TestData) {
    this.client = new OpenAI({ apiKey });
    this.testData = testData;
  }

  async analyzeScreenshot(
    screenshotPath: string,
    userGoal?: string,
    previousActions?: string[]
  ): Promise<{ action: ActionDecision; attentionPoints: AttentionPoint[] }> {
    const imageBuffer = fs.readFileSync(screenshotPath);
    const base64Image = imageBuffer.toString("base64");

    // Build test data reference for the prompt
    const testDataInfo = this.testData ? `
TEST DATA AVAILABLE FOR FORM FILLING:
- Email: ${this.testData.email}
- Name: ${this.testData.firstName} ${this.testData.lastName}
- Phone: ${this.testData.phone}
- Address: ${this.testData.streetAddress}, ${this.testData.city}, ${this.testData.state} ${this.testData.postalCode}
- Country: ${this.testData.country}
- Payment Card: ${this.testData.cardNumber} (Exp: ${this.testData.cardExpiry}, CVC: ${this.testData.cardCvc})
` : "";

    const goalContext = userGoal
      ? `\nUser goal: ${userGoal}`
      : "\nNo specific goal provided - explore the website naturally.";

    const historyContext =
      previousActions && previousActions.length > 0
        ? `\n\nPrevious actions taken:\n${previousActions.slice(-5).join("\n")}`
        : "";

    const userPrompt = `You are a usability testing AI analyzing a website screenshot. Analyze this image and decide the next action to take.${goalContext}${historyContext}${testDataInfo}

ACTION TYPES:
1. "click": Click on an interactive element (button, link, input field, etc.)
2. "type": Fill text into a form field (use after clicking or if field is already focused)
3. "scroll": Scroll up or down the page ("up" or "down") - USE THIS if form fields are cut off at bottom, or if you need to see buttons below
4. "wait": Wait for content to load
5. "navigate": Navigate to a URL
6. "none": No more actions needed - goal achieved or stuck

FORM FILLING STRATEGY:
- If you see empty form fields (email, name, address, etc.), use "type" action to fill them DIRECTLY
- DO NOT click on form fields - just use "type" action with the field description and the value to enter
- The "type" action will intelligently find and focus the field, then enter the text
- Use the test data provided above in this prompt to fill forms
- Adapt field values appropriately (e.g., use email for email fields, phone for phone fields)
- IMPORTANT: type actions are for filling text INTO fields, not for clicking on them first
- If a form extends beyond the visible area or you need to see more fields/buttons, SCROLL DOWN first
- After scrolling, the next iteration will show the scrolled content

SCROLLING GUIDANCE:
- If the form is partially cut off at the bottom, scroll down to see the full form
- If you can't find a "Next", "Continue", "Submit", or "Checkout" button, it's likely below - scroll down!
- If a slider or multi-step form is showing and you've filled the visible fields, scroll down to find the next section
- Use "scroll": "down" or "scroll": "up" as needed

ATTENTION POINTS INSTRUCTIONS:
- ALWAYS include 2-4 attention points per action showing what you're focusing on
- attentionPoints is an array showing primary (high intensity 0.7-1.0), secondary (0.4-0.7), and tertiary (0.1-0.4) focus areas
- Primary attention: Where you're interacting (highest intensity, e.g., 0.9)
- Secondary attention: Related UI elements you're considering (medium intensity, e.g., 0.6)
- Tertiary attention: Supporting information or context (lower intensity, e.g., 0.3)
- Each point must have x, y (0-100), intensity (0-1), and description

COORDINATE INSTRUCTIONS - MUST FOLLOW THESE RULES:
- ALWAYS include coordinates for click and type actions
- x and y MUST be between 0 and 100 (representing percentages of screen width/height)
- x=0 is far left, x=100 is far right
- y=0 is top, y=100 is bottom
- NO EXCEPTIONS: If coordinates would be outside 0-100, recalculate them
- Example valid coordinates: {x: 25, y: 50}, {x: 75, y: 20}, {x: 50, y: 75}
- Example INVALID coordinates: {x: 700, y: 65} ← WRONG, recalculate!

COORDINATE EXAMPLES FOR COMMON UI:
- Text input field on left side: {x: 25, y: 40}
- Text input field in center: {x: 50, y: 40}
- Text input field on right side: {x: 75, y: 40}
- Button below inputs: {x: 50, y: 75}
- Close button at top-right: {x: 95, y: 5}
- Product card top-left area: {x: 20, y: 30}

VALIDATION: Before responding, verify all coordinates are 0-100.

Please respond with ONLY a valid JSON object (no markdown, no additional text):
{
  "action": {
    "type": "click" | "type" | "scroll" | "wait" | "navigate" | "none",
    "target": "description of element to interact with (if applicable)",
    "value": "text to type or value to enter (if applicable) - for scroll, use 'up' or 'down'",
    "reasoning": "explanation of why you chose this action",
    "confidence": 0.0-1.0,
    "coordinates": {
      "x": 50,
      "y": 50
    }
  },
  "attentionPoints": [
    {
      "x": 50,
      "y": 50,
      "intensity": 0.9,
      "description": "primary focus - what you're interacting with"
    },
    {
      "x": 25,
      "y": 30,
      "intensity": 0.6,
      "description": "secondary area - related UI elements"
    },
    {
      "x": 75,
      "y": 70,
      "intensity": 0.4,
      "description": "tertiary area - supporting information"
    }
  ]
}`;

    const response = await this.client.chat.completions.create({
      model: "gpt-6.1-terra",
      max_completion_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
                detail: "low",
              },
            },
            {
              type: "text",
              text: userPrompt,
            },
          ],
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response from OpenAI");
    }

    // Extract JSON from response (handle cases where it might be wrapped)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in response: ${content}`);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and fix coordinates
    if (parsed.action.coordinates) {
      const coords = parsed.action.coordinates;
      // Clamp coordinates to 0-100 range
      coords.x = Math.max(0, Math.min(100, coords.x));
      coords.y = Math.max(0, Math.min(100, coords.y));
    }

    // Validate and fix attention points coordinates
    if (parsed.attentionPoints && Array.isArray(parsed.attentionPoints)) {
      parsed.attentionPoints = parsed.attentionPoints.map((point: any) => ({
        x: Math.max(0, Math.min(100, point.x || 50)),
        y: Math.max(0, Math.min(100, point.y || 50)), // No scaling needed - AI analyzes full-page screenshots
        intensity: Math.max(0, Math.min(1, point.intensity || 0.5)),
        description: point.description || "attention point",
      }));
      console.log(`  📌 Attention points:`, parsed.attentionPoints.map((p: any) => `(${p.x.toFixed(0)},${p.y.toFixed(0)}%)`).join(', '));
    }

    // Log the full parsed response for debugging
    console.log(`  📋 AI Response: action=${parsed.action.type}, confidence=${parsed.action.confidence}`);
    if (parsed.action.coordinates) {
      console.log(`     Coordinates: (${parsed.action.coordinates.x}%, ${parsed.action.coordinates.y}%)`);
    }

    return {
      action: {
        action: parsed.action.type,
        target: parsed.action.target,
        value: parsed.action.value,
        reasoning: parsed.action.reasoning,
        confidence: parsed.action.confidence,
        coordinates: parsed.action.coordinates, // Extract coordinates from AI response
      },
      attentionPoints: parsed.attentionPoints || [],
    };
  }
}
