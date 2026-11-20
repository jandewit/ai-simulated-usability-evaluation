import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { SimulatedUserConfig, Session, SessionStep } from "./types.js";
import { VisionAnalyzer } from "./visionAnalyzer.js";
import { BrowserController } from "./browserController.js";
import { HeatmapGenerator } from "./heatmapGenerator.js";
import { SusEvaluator } from "./susEvaluator.js";

export class SimulatedUser {
  private config: SimulatedUserConfig;
  private session: Session;
  private visionAnalyzer: VisionAnalyzer;
  private browserController: BrowserController;
  private susEvaluator: SusEvaluator;
  private outputDir: string;
  private consecutiveFailures: number = 0;

  constructor(config: SimulatedUserConfig) {
    this.config = {
      maxIterations: 5,
      outputDir: "./output",
      headless: true,
      ...config,
    };

    this.outputDir = this.config.outputDir!;
    this.createOutputDirectory();

    this.session = {
      id: randomUUID(),
      startTime: new Date().toISOString(),
      targetUrl: config.targetUrl,
      userGoal: config.userGoal,
      steps: [],
      status: "active",
    };

    this.visionAnalyzer = new VisionAnalyzer(config.apiKey, config.testData);
    this.susEvaluator = new SusEvaluator(config.apiKey);
    this.browserController = new BrowserController(this.outputDir);
  }

  private createOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async run(): Promise<Session> {
    try {
      console.log(`🚀 Starting simulated user session: ${this.session.id}`);
      console.log(`📍 Target URL: ${this.config.targetUrl}`);
      if (this.config.userGoal) {
        console.log(`🎯 User Goal: ${this.config.userGoal}`);
      }

      await this.browserController.launch(this.config.headless);
      await this.browserController.navigate(this.config.targetUrl);

      const maxIterations = this.config.maxIterations || 5;

      for (let i = 0; i < maxIterations; i++) {
        console.log(`\n📸 Iteration ${i + 1}/${maxIterations}`);

        const step = await this.executeIteration(i + 1);
        this.session.steps.push(step);

        // Check for early stopping conditions
        const { shouldStop, reason } = this.checkStoppingConditions(step);
        if (shouldStop) {
          console.log(`\n⏹️  Early stopping: ${reason}`);
          this.session.status = "stopped_early";
          this.session.stoppingReason = reason;
          break;
        }

        console.log(`✅ Action: ${step.action.action} - ${step.action.reasoning}`);
        console.log(
          `📌 Attention points: ${step.attentionPoints.length} focus areas detected`
        );
      }

      // Evaluate website usability with SUS at the end
      if (this.session.steps.length > 0) {
        console.log("\n📊 Evaluating website usability with System Usability Scale...");
        try {
          const lastStep = this.session.steps[this.session.steps.length - 1];
          this.session.susEvaluation = await this.susEvaluator.evaluateSessionUsability(
            lastStep.screenshotPath,
            this.session.steps,
            this.config.userGoal
          );
          console.log(`✅ SUS Score: ${this.session.susEvaluation.score}/100 (${this.session.susEvaluation.adjective})`);
        } catch (error) {
          console.warn("⚠️  SUS evaluation failed:", error);
        }
      }

      if (this.session.status === "active") {
        this.session.status = "completed";
      }
      this.session.endTime = new Date().toISOString();

      await this.generateReport();

      console.log(`\n✨ Session completed: ${this.session.id}`);
      console.log(`📊 Output directory: ${this.outputDir}`);

      return this.session;
    } catch (error) {
      this.session.status = "failed";
      this.session.errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Session failed:", error);
      throw error;
    } finally {
      await this.browserController.close();
    }
  }

  private async executeIteration(iteration: number): Promise<SessionStep> {
    // Take screenshot of current state
    const screenshotFileName = `screenshot_${iteration}.png`;
    const screenshotPath = await this.browserController.takeScreenshot(
      screenshotFileName
    );

    // Get page info
    const pageInfo = await this.browserController.getPageInfo();

    // Analyze screenshot
    const previousActions = this.session.steps.map(
      (s) => `Iteration ${s.iteration}: ${s.action.action} - ${s.action.reasoning}`
    );

    const { action, attentionPoints } = await this.visionAnalyzer.analyzeScreenshot(
      screenshotPath,
      this.config.userGoal,
      previousActions
    );

    // Generate heatmap
    const heatmapSvgFileName = `heatmap_${iteration}.svg`;
    const heatmapSvgPath = path.join(this.outputDir, heatmapSvgFileName);
    HeatmapGenerator.generateHeatmapOverlay(
      screenshotPath,
      attentionPoints,
      heatmapSvgPath
    );

    // Generate heatmap HTML visualization
    const heatmapHtmlFileName = `heatmap_${iteration}.html`;
    const heatmapHtmlPath = path.join(this.outputDir, heatmapHtmlFileName);
    HeatmapGenerator.generateHeatmapHTML(
      screenshotPath,
      heatmapSvgPath,
      heatmapHtmlPath,
      iteration,
      attentionPoints
    );

    const step: SessionStep = {
      iteration,
      timestamp: new Date().toISOString(),
      screenshotPath,
      action,
      attentionPoints,
      pageTitle: pageInfo.title,
      pageUrl: pageInfo.url,
    };

    // Execute action AFTER capturing and analyzing the screenshot
    if (action.action !== "none") {
      let actionDesc = `${action.action} on ${action.target}`;
      if (action.coordinates) {
        actionDesc += ` at (${action.coordinates.x}%, ${action.coordinates.y}%)`;
      }
      console.log(`⚡ Executing: ${actionDesc}`);
      console.log(`   Confidence: ${(action.confidence * 100).toFixed(0)}% | Reason: ${action.reasoning}`);
      await this.browserController.executeAction(action);
      
      // Wait a bit for page to settle after action
      await this.browserController.waitForNavigation();
    }

    return step;
  }

  private checkStoppingConditions(step: SessionStep): {
    shouldStop: boolean;
    reason: string;
  } {
    // Stop if AI decides to do nothing (reached end state)
    if (step.action.action === "none") {
      return {
        shouldStop: true,
        reason: "AI reached end state (no more actions)",
      };
    }

    // Stop if AI is very uncertain (confidence < 30%)
    if (step.action.confidence < 0.3) {
      return {
        shouldStop: true,
        reason: `AI confidence too low (${(step.action.confidence * 100).toFixed(1)}%)`,
      };
    }

    // Track consecutive failures (low confidence actions)
    if (step.action.confidence < 0.5) {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= 2) {
        return {
          shouldStop: true,
          reason: "Website appears to be broken or inaccessible (2+ uncertain actions)",
        };
      }
    } else {
      this.consecutiveFailures = 0; // Reset on successful action
    }

    return { shouldStop: false, reason: "" };
  }

  private async generateReport(): Promise<void> {
    const reportPath = path.join(this.outputDir, "session_report.json");
    fs.writeFileSync(reportPath, JSON.stringify(this.session, null, 2));

    // Generate main index HTML
    const indexHtml = this.generateIndexHtml();
    fs.writeFileSync(path.join(this.outputDir, "index.html"), indexHtml);

    console.log(`📄 Report saved to: ${reportPath}`);
  }

  private generateIndexHtml(): string {
    const steps = this.session.steps
      .map(
        (step) => `
    <tr>
      <td>${step.iteration}</td>
      <td>${step.timestamp}</td>
      <td><strong>${step.action.action}</strong></td>
      <td>${step.action.reasoning}</td>
      <td>${(step.action.confidence * 100).toFixed(1)}%</td>
      <td>${step.attentionPoints.length}</td>
      <td>
        <a href="heatmap_${step.iteration}.html" target="_blank">View Heatmap</a>
      </td>
    </tr>
  `
      )
      .join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulated User Session Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 1.1em;
      opacity: 0.9;
    }
    
    .content {
      padding: 30px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .info-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .info-card h3 {
      font-size: 0.9em;
      opacity: 0.9;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .info-card p {
      font-size: 1.3em;
      font-weight: bold;
      word-break: break-all;
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    th {
      background: #2c3e50;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #667eea;
    }
    
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #ecf0f1;
    }
    
    tr:hover {
      background: #f8f9fa;
    }
    
    a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s;
    }
    
    a:hover {
      color: #764ba2;
    }
    
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status.completed {
      background: #d4edda;
      color: #155724;
    }

    .status.stopped_early {
      background: #fff3cd;
      color: #856404;
    }
    
    .status.active {
      background: #cce5ff;
      color: #004085;
    }

    .status.failed {
      background: #f8d7da;
      color: #721c24;
    }
    
    .footer {
      background: #ecf0f1;
      padding: 20px 30px;
      text-align: center;
      font-size: 0.9em;
      color: #7f8c8d;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 Simulated User Testing Report</h1>
      <p>AI-Powered Usability Analysis</p>
    </div>
    
    <div class="content">
      <div class="info-grid">
        <div class="info-card">
          <h3>Session ID</h3>
          <p>${this.session.id}</p>
        </div>
        <div class="info-card">
          <h3>Status</h3>
          <p>${this.session.status.toUpperCase()}</p>
        </div>
        <div class="info-card">
          <h3>Target URL</h3>
          <p>${this.session.targetUrl}</p>
        </div>
        <div class="info-card">
          <h3>Iterations</h3>
          <p>${this.session.steps.length}</p>
        </div>
      </div>
      
      ${
        this.session.userGoal
          ? `
      <div class="info-card" style="grid-column: 1 / -1;">
        <h3>User Goal</h3>
        <p>${this.session.userGoal}</p>
      </div>
      `
          : ""
      }

      ${
        this.session.susEvaluation
          ? `
      <div style="grid-column: 1 / -1; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="font-size: 1.2em; margin-bottom: 15px;">📊 System Usability Scale (SUS) Evaluation</h3>
        
        <!-- SUS Score Card -->
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 20px; margin-bottom: 20px; align-items: center;">
          <div style="text-align: center;">
            <div style="font-size: 3.5em; font-weight: bold; line-height: 1;">${this.session.susEvaluation.score}</div>
            <div style="font-size: 0.85em; opacity: 0.9;">/ 100</div>
            <div style="font-size: 1em; font-weight: 600; margin-top: 10px; padding: 5px 10px; background: rgba(255,255,255,0.3); border-radius: 4px;">${this.session.susEvaluation.adjective.toUpperCase()}</div>
          </div>
          <div>
            <div style="font-size: 0.95em; line-height: 1.6;">
              <strong>Score Range:</strong> <85-100: Excellent | 68-84: Good | 50-67: OK | <50: Poor<br>
              <strong>Industry Benchmark:</strong> 68<br>
              <strong>Interpretation:</strong> ${this.getSusInterpretation(this.session.susEvaluation.score)}
            </div>
          </div>
        </div>
        
        <!-- 10-Item SUS Questions Table -->
        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 4px; margin-bottom: 15px; font-size: 0.9em;">
          <div style="font-weight: 600; margin-bottom: 10px;">10-Item Questionnaire Responses (1=Strongly Disagree, 5=Strongly Agree):</div>
          <div style="display: grid; gap: 8px;">
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 10px; font-size: 0.85em;">
              <div style="font-weight: 600;">Q1:</div>
              <div>I think that I would like to use this website frequently.</div>
              <div style="text-align: right; font-weight: bold; color: #fff;"><strong>${this.session.susEvaluation.questions["1"]}</strong>/5</div>
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 10px; font-size: 0.85em;">
              <div style="font-weight: 600;">Q2:</div>
              <div>I found the website unnecessarily complex.</div>
              <div style="text-align: right; font-weight: bold; color: #fff;"><strong>${this.session.susEvaluation.questions["2"]}</strong>/5</div>
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 10px; font-size: 0.85em;">
              <div style="font-weight: 600;">Q3:</div>
              <div>I thought the website was easy to use.</div>
              <div style="text-align: right; font-weight: bold; color: #fff;"><strong>${this.session.susEvaluation.questions["3"]}</strong>/5</div>
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 10px; font-size: 0.85em;">
              <div style="font-weight: 600;">Q4:</div>
              <div>I think that I would need the support of a technical person to be able to use this website.</div>
              <div style="text-align: right; font-weight: bold; color: #fff;"><strong>${this.session.susEvaluation.questions["4"]}</strong>/5</div>
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 10px; font-size: 0.85em;">
              <div style="font-weight: 600;">Q5:</div>
              <div>I found the various functions in the website were well integrated.</div>
              <div style="text-align: right; font-weight: bold; color: #fff;"><strong>${this.session.susEvaluation.questions["5"]}</strong>/5</div>
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 10px; font-size: 0.85em;">
              <div style="font-weight: 600;">Q6:</div>
              <div>I thought there was too much inconsistency in this website.</div>
              <div style="text-align: right; font-weight: bold; color: #fff;"><strong>${this.session.susEvaluation.questions["6"]}</strong>/5</div>
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 10px; font-size: 0.85em;">
              <div style="font-weight: 600;">Q7:</div>
              <div>I imagine that most people would learn to use this website very quickly.</div>
              <div style="text-align: right; font-weight: bold; color: #fff;"><strong>${this.session.susEvaluation.questions["7"]}</strong>/5</div>
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 10px; font-size: 0.85em;">
              <div style="font-weight: 600;">Q8:</div>
              <div>I found the website very awkward to use.</div>
              <div style="text-align: right; font-weight: bold; color: #fff;"><strong>${this.session.susEvaluation.questions["8"]}</strong>/5</div>
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 10px; font-size: 0.85em;">
              <div style="font-weight: 600;">Q9:</div>
              <div>I felt very confident using the website.</div>
              <div style="text-align: right; font-weight: bold; color: #fff;"><strong>${this.session.susEvaluation.questions["9"]}</strong>/5</div>
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 10px; font-size: 0.85em;">
              <div style="font-weight: 600;">Q10:</div>
              <div>I needed to learn a lot of things before I could get going with this website.</div>
              <div style="text-align: right; font-weight: bold; color: #fff;"><strong>${this.session.susEvaluation.questions["10"]}</strong>/5</div>
            </div>
          </div>
        </div>
        
        <!-- Analysis -->
        <div style="background: rgba(0,0,0,0.15); padding: 10px; border-radius: 4px; font-size: 0.9em;">
          <strong>Analysis:</strong> ${this.session.susEvaluation.analysis}
        </div>
      </div>
      `
          : ""
      }
      
      <h2 style="margin-top: 30px; margin-bottom: 15px; color: #2c3e50;">Session Timeline</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Reasoning</th>
              <th>Confidence</th>
              <th>Attention Points</th>
              <th>Visualization</th>
            </tr>
          </thead>
          <tbody>
            ${steps}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="footer">
      <p>Generated on ${new Date().toLocaleString()} | Session Duration: ${this.getSessionDuration()}${
        this.session.stoppingReason ? ` | Stopped Early: ${this.session.stoppingReason}` : ""
      }</p>
    </div>
  </div>
</body>
</html>`;
  }

  private getSessionDuration(): string {
    if (!this.session.endTime) return "In progress";
    const start = new Date(this.session.startTime);
    const end = new Date(this.session.endTime);
    const seconds = Math.round((end.getTime() - start.getTime()) / 1000);
    return `${seconds}s`;
  }

  private getSusInterpretation(score: number): string {
    if (score >= 85) return "Excellent - World-class usability, users will return frequently";
    if (score >= 68) return "Good - Strong usability, most users are satisfied";
    if (score >= 50) return "OK - Acceptable, but improvements needed";
    return "Poor - Significant usability issues, redesign recommended";
  }
}
