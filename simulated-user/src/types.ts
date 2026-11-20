export interface TestData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
}

export interface SimulatedUserConfig {
  targetUrl: string;
  apiKey: string;
  maxIterations?: number;
  outputDir?: string;
  userGoal?: string;
  headless?: boolean;
  testData?: TestData;
}

export interface ActionDecision {
  action: "click" | "type" | "scroll" | "wait" | "navigate" | "none";
  target?: string;
  value?: string;
  reasoning: string;
  confidence: number;
  coordinates?: {
    x: number; // 0-100 (percentage of screen width)
    y: number; // 0-100 (percentage of screen height)
  };
}

export interface AttentionPoint {
  x: number;
  y: number;
  intensity: number;
  description: string;
}

export interface SessionStep {
  iteration: number;
  timestamp: string;
  screenshotPath: string;
  action: ActionDecision;
  attentionPoints: AttentionPoint[];
  pageTitle?: string;
  pageUrl?: string;
}

export interface SystemUsabilityScale {
  score: number; // 0-100, calculated from 10 questions
  adjective: string; // "poor", "ok", "good", "excellent"
  timestamp: string;
  
  // 10-item SUS questionnaire responses (1-5 scale)
  questions: {
    1: number; // "I think that I would like to use this website frequently."
    2: number; // "I found the website unnecessarily complex."
    3: number; // "I thought the website was easy to use."
    4: number; // "I think that I would need the support of a technical person..."
    5: number; // "I found the various functions in the website were well integrated."
    6: number; // "I thought there was too much inconsistency in this website."
    7: number; // "I imagine that most people would learn to use this website very quickly."
    8: number; // "I found the website very awkward to use."
    9: number; // "I felt very confident using the website."
    10: number; // "I needed to learn a lot of things before I could get going..."
  };
  
  // Analysis
  analysis: string;
}

export interface Session {
  id: string;
  startTime: string;
  endTime?: string;
  targetUrl: string;
  userGoal?: string;
  steps: SessionStep[];
  status: "active" | "completed" | "failed" | "stopped_early";
  errorMessage?: string;
  stoppingReason?: string;
  susEvaluation?: SystemUsabilityScale;
}
