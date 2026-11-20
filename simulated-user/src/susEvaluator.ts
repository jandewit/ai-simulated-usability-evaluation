import OpenAI from "openai";
import fs from "fs";
import { SystemUsabilityScale, SessionStep } from "./types.js";

export class SusEvaluator {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async evaluateSessionUsability(
    screenshotPath: string,
    steps: SessionStep[],
    userGoal?: string
  ): Promise<SystemUsabilityScale> {
    const imageBuffer = fs.readFileSync(screenshotPath);
    const base64Image = imageBuffer.toString("base64");

    const stepsSummary = steps
      .map(
        (step) => `
Step ${step.iteration}:
  - Action: ${step.action.action}
  - Target: ${step.action.target || "N/A"}
  - Reasoning: ${step.action.reasoning}
  - Confidence: ${(step.action.confidence * 100).toFixed(1)}%
  - Page: ${step.pageTitle || "Unknown"}`
      )
      .join("\n");

    const goalContext = userGoal ? `User's goal: ${userGoal}\n` : "";

    const evaluationPrompt = `You are a usability expert evaluating a website based on AI simulated user interactions using the validated System Usability Scale (SUS) questionnaire.

${goalContext}
Final state screenshot is provided. Here's the interaction history:

${stepsSummary}

Rate this website on the official 10-item SUS questionnaire. For each question, provide a rating from 1 (Strongly Disagree) to 5 (Strongly Agree) based on what you observe from the screenshot and interaction history.

The 10 SUS questions are:
1. I think that I would like to use this website frequently.
2. I found the website unnecessarily complex.
3. I thought the website was easy to use.
4. I think that I would need the support of a technical person to be able to use this website.
5. I found the various functions in the website were well integrated.
6. I thought there was too much inconsistency in this website.
7. I imagine that most people would learn to use this website very quickly.
8. I found the website very awkward to use.
9. I felt very confident using the website.
10. I needed to learn a lot of things before I could get going with this website.

Respond with ONLY a valid JSON object (no markdown, no additional text):
{
  "questions": {
    "1": 4,
    "2": 2,
    "3": 4,
    "4": 2,
    "5": 4,
    "6": 2,
    "7": 4,
    "8": 2,
    "9": 4,
    "10": 2
  },
  "analysis": "Brief analysis of the website based on these responses"
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
              text: evaluationPrompt,
            },
          ],
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response from OpenAI for SUS evaluation");
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in SUS response: ${content}`);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Calculate SUS score using the official formula
    // Odd questions (1,3,5,7,9): contribution = response - 1
    // Even questions (2,4,6,8,10): contribution = 5 - response
    // Total score = sum of contributions * 2.5 (scales to 0-100)
    const contribution =
      (parsed.questions["1"] - 1) +
      (5 - parsed.questions["2"]) +
      (parsed.questions["3"] - 1) +
      (5 - parsed.questions["4"]) +
      (parsed.questions["5"] - 1) +
      (5 - parsed.questions["6"]) +
      (parsed.questions["7"] - 1) +
      (5 - parsed.questions["8"]) +
      (parsed.questions["9"] - 1) +
      (5 - parsed.questions["10"]);

    const score = Math.round(contribution * 2.5);

    // Determine adjective based on score
    let adjective: string;
    if (score >= 85) {
      adjective = "excellent";
    } else if (score >= 68) {
      adjective = "good";
    } else if (score >= 50) {
      adjective = "ok";
    } else {
      adjective = "poor";
    }

    return {
      score,
      adjective,
      questions: parsed.questions,
      analysis: parsed.analysis,
      timestamp: new Date().toISOString(),
    };
  }
}
