import { 
  performDeepAnalysis, 
  generateUserScenarios, 
  generateLogicFlow, 
  generateUI, 
  generateTechStack, 
  performFinalValidation,
  generateConceptImage
} from './geminiService';
import { 
  AppStep, 
  ArchitecturalBlueprint, 
  GroundingChunk,
  ValidationIssue,
  Scenario,
  LogicNode,
  UIComponent,
  TechStackItem,
  DesignSystem
} from '../types';
import { Language } from '../translations';

export interface PipelineResult {
  blueprint: ArchitecturalBlueprint;
  groundingLinks: GroundingChunk[];
}

/**
 * Validates the structural integrity of the generated data programmatically.
 * Adds system-level warnings if specific criteria aren't met.
 */
const validateIntegrity = (
  scenarios: Scenario[], 
  logic: LogicNode[], 
  ui: UIComponent[],
  designSystem: DesignSystem,
  stack: TechStackItem[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // Scenarios Check
  if (!scenarios || !Array.isArray(scenarios) || scenarios.length < 3) {
    issues.push({ 
      category: 'UX', 
      severity: 'Warning', 
      issue: 'Low Scenario Count', 
      recommendation: 'The system generated fewer than 3 scenarios. Consider elaborating on the idea for broader coverage.' 
    });
  }

  // Logic Check
  if (!logic || !Array.isArray(logic) || logic.length < 5) {
    issues.push({ 
      category: 'Logic', 
      severity: 'Warning', 
      issue: 'Simplistic Logic Flow', 
      recommendation: 'The logic graph is small. Ensure the application logic covers edge cases and error handling.' 
    });
  }

  // UI Check
  if (!ui || !Array.isArray(ui) || ui.length === 0) {
    issues.push({ 
      category: 'UX', 
      severity: 'Critical', 
      issue: 'Missing UI Blueprints', 
      recommendation: 'No UI components were generated. This usually indicates a failure in the UI step.' 
    });
  }
  
  // Design System Check
  if (!designSystem || !designSystem.colorPalette || !designSystem.typography) {
    issues.push({
      category: 'UX',
      severity: 'Warning',
      issue: 'Incomplete Design System',
      recommendation: 'Design system generation was partial. Default styles may apply.'
    });
  }

  // Stack Check (Enhanced)
  if (!stack || !Array.isArray(stack) || stack.length === 0) {
    issues.push({
      category: 'Tech',
      severity: 'Critical',
      issue: 'Missing Tech Stack',
      recommendation: 'Tech stack generation failed. Please retry.'
    });
  } else {
    // Check individual items for missing fields
    const invalidItems = stack.filter(item => !item.tool || !item.category);
    if (invalidItems.length > 0) {
      issues.push({
        category: 'Tech',
        severity: 'Warning',
        issue: 'Incomplete Tech Stack Items',
        recommendation: 'Some tech stack recommendations are missing required tool names or categories.'
      });
    }
  }

  return issues;
};

export const generateFullArchitecture = async (
  idea: string, 
  imageSize: '1K' | '2K' | '4K',
  lang: Language,
  onStepChange: (step: AppStep) => void
): Promise<PipelineResult> => {
  const allLinks: GroundingChunk[] = [];

  // Helper to execute a single pipeline step with standard error handling and link collection
  const executeStep = async <T>(
    step: AppStep, 
    stepName: string, 
    operation: () => Promise<{ data: T; links: GroundingChunk[] }>,
    retries: number = 0
  ): Promise<T> => {
    try {
      onStepChange(step);
      const result = await operation();
      
      // Aggregate grounding links if present
      if (result.links && Array.isArray(result.links)) {
        allLinks.push(...result.links);
      }
      
      return result.data;
    } catch (error: any) {
      if (retries > 0) {
        console.warn(`Retrying ${stepName}, attempts left: ${retries}`);
        return executeStep(step, stepName, operation, retries - 1);
      }
      console.error(`Pipeline Failure at [${stepName}]:`, error);
      throw new Error(`Pipeline failed at ${stepName}. Please retry or check the input idea.`);
    }
  };

  try {
    // 1. Deep Analysis (Intent & Domain)
    const analysis = await executeStep(
      AppStep.ANALYSIS, 
      "Deep Analysis", 
      () => performDeepAnalysis(idea, lang),
      1
    );

    // 2. User Scenarios
    const scenariosData = await executeStep(
      AppStep.SCENARIOS, 
      "User Scenarios", 
      () => generateUserScenarios(idea, analysis, lang),
      1
    );

    // 3. Logic Flow
    const logicData = await executeStep(
      AppStep.LOGIC, 
      "System Logic", 
      () => generateLogicFlow(scenariosData.scenarios, lang),
      1
    );

    // 4. UI Design & Image Generation (Parallel)
    onStepChange(AppStep.UI);
    const [uiData, imageUrl] = await Promise.all([
      executeStep(
        AppStep.UI, 
        "UI Blueprints", 
        () => generateUI(analysis.appName, scenariosData.scenarios, logicData.logicFlow, lang),
        1
      ),
      generateConceptImage(analysis.executiveSummary || idea, imageSize).catch(e => {
        console.error("Image generation failed", e);
        return undefined;
      })
    ]);

    // 5. Tech Stack
    const stackData = await executeStep(
      AppStep.STACK, 
      "Tech Stack", 
      () => generateTechStack(analysis.appName, logicData.logicFlow, uiData.uiBlueprints, lang),
      1
    );

    // 6. Final Validation (AI Assessment)
    const validationData = await executeStep(
      AppStep.VALIDATION, 
      "Final Validation", 
      () => performFinalValidation(analysis, scenariosData.scenarios, logicData.logicFlow, stackData.techStack, lang),
      1
    );

    // 7. Programmatic Integrity Check
    const systemIssues = validateIntegrity(
      scenariosData.scenarios, 
      logicData.logicFlow, 
      uiData.uiBlueprints,
      uiData.designSystem,
      stackData.techStack
    );

    // Merge validation reports and remove duplicates by issue string
    const allReports: ValidationIssue[] = [...(validationData.validationReport || []), ...systemIssues];
    const uniqueReports = allReports.filter((v,i,a) => a.findIndex(x => x.issue === v.issue) === i);

    // Mark as Complete
    onStepChange(AppStep.COMPLETE);

    // Construct Final Blueprint with safety checks
    const blueprint: ArchitecturalBlueprint = {
      appName: analysis.appName || "Untitled Project",
      tagline: analysis.tagline || "Analysis complete",
      executiveSummary: analysis.executiveSummary || "No summary provided.",
      maturityAssessment: analysis.maturityAssessment || { score: 0, verdict: 'Concept', gapAnalysis: 'N/A' },
      logicLayer: analysis.logicLayer || { inputBoundaries: { analyzableScope: [], outOfScope: [] }, assumptions: [], detectedConflicts: [] },
      scenarios: scenariosData.scenarios || [],
      designSystem: uiData.designSystem,
      uiBlueprints: uiData.uiBlueprints || [],
      logicFlow: logicData.logicFlow || [],
      techStack: stackData.techStack || [],
      validationReport: uniqueReports,
      generatedImage: imageUrl
    };

    return { 
      blueprint, 
      groundingLinks: allLinks 
    };

  } catch (error) {
    // Re-throw to be handled by the UI
    throw error;
  }
};