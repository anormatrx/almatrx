export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export enum AppStep {
  INPUT = 0,
  ANALYSIS = 1,     // Intent & Domain (Grounding ON)
  SCENARIOS = 2,    // User Stories
  LOGIC = 3,        // Data Flow
  UI = 4,           // Visual Blueprints & Design System
  STACK = 5,        // Tech Selection (Grounding ON)
  VALIDATION = 6,   // Final Integrity Check
  COMPLETE = 7
}

export interface ProjectState {
  idea: string;
  isGenerating: boolean;
  currentStep: AppStep;
  error: string | null;
  result: ArchitecturalBlueprint | null;
  groundingLinks: GroundingChunk[];
}

export interface Scenario {
  id: string;
  title: string;
  userStory: string;
  acceptanceCriteria: string[];
  priority: 'Critical' | 'High' | 'Medium';
}

export interface DesignSystem {
  colorPalette: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  typography: {
    fontFamilyHeadings: string;
    fontFamilyBody: string;
  };
  layoutStrategy: string;
}

export interface UIComponent {
  name: string;
  description: string;
  codeSnippet: string; // Full HTML string with Tailwind classes
  usageContext: string;
}

export interface LogicNode {
  id: string;
  name: string;
  type: 'Input' | 'Process' | 'Decision' | 'Output' | 'Database' | 'External API';
  connections: string[]; // Target IDs
}

export interface TechStackItem {
  category: string;
  tool: string;
  reasoning: string;
  rejectedAlternatives: { name: string; reason: string }[];
  riskAssessment: {
    severity: 'High' | 'Medium' | 'Low';
    mitigation: string;
  };
  costComplexity: 'Low' | 'Medium' | 'High';
  pros: string[];
  cons: string[];
}

export interface Assumption {
  statement: string;
  confidenceScore: number; // 0-100
  riskLevel: 'High' | 'Medium' | 'Low';
}

export interface ValidationIssue {
  category: 'Logic' | 'Security' | 'UX' | 'Tech';
  severity: 'Critical' | 'Warning' | 'Info';
  issue: string;
  recommendation: string;
}

export interface MaturityAssessment {
  score: number; // 0-100
  verdict: 'Concept' | 'Emerging' | 'Mature' | 'Production-Ready';
  gapAnalysis: string;
}

export interface Conflict {
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  resolutionSuggestion: string;
}

export interface LogicLayer {
  inputBoundaries: {
    analyzableScope: string[];
    outOfScope: string[];
  };
  assumptions: Assumption[];
  detectedConflicts: Conflict[];
}

// Unified Result Type
export interface ArchitecturalBlueprint {
  appName: string;
  tagline: string;
  executiveSummary: string;
  maturityAssessment: MaturityAssessment;
  logicLayer: LogicLayer;
  scenarios: Scenario[];
  designSystem: DesignSystem;
  uiBlueprints: UIComponent[];
  logicFlow: LogicNode[];
  techStack: TechStackItem[];
  validationReport: ValidationIssue[];
  generatedImage?: string;
}