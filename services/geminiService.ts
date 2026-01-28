import { GoogleGenAI, Type, Schema, GenerateContentResponse } from "@google/genai";
import { 
  GroundingChunk, 
  MaturityAssessment, 
  LogicLayer,
  Scenario,
  LogicNode,
  UIComponent,
  TechStackItem,
  DesignSystem,
  ValidationIssue
} from "../types";
import { Language } from "../translations";

// Helper to get fresh instance (needed for dynamic API keys)
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

async function generateStep<T>(
  prompt: string, 
  responseSchema: Schema, 
  systemInstruction: string = "You are a senior software architect.",
  useGrounding: boolean = false,
  model: string = 'gemini-2.5-flash-lite',
  thinkingBudget?: number,
  lang: Language = 'en'
): Promise<{ data: T, links: GroundingChunk[] }> {
  
  const ai = getAI();
  const tools = useGrounding ? [{ googleSearch: {} }] : [];
  
  // Append language instruction
  const langInstruction = lang === 'ar' 
    ? "IMPORTANT: You MUST generate all text content in Arabic language (العربية). Technical terms can remain in English where appropriate for clarity, but descriptions and analysis must be Arabic."
    : "Generate content in English.";

  const finalSystemInstruction = `${systemInstruction}\n${langInstruction}`;
  
  const config: any = {
    systemInstruction: finalSystemInstruction,
    responseMimeType: "application/json",
    responseSchema: responseSchema,
    tools: tools,
  };

  if (thinkingBudget) {
    config.thinkingConfig = { thinkingBudget };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response from Gemini.");
    }

    let data: T;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      throw new Error("Invalid JSON response from model.");
    }

    const links: GroundingChunk[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      links.push(...response.candidates[0].groundingMetadata.groundingChunks);
    }

    return { data, links };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export const performDeepAnalysis = async (idea: string, lang: Language) => {
  const prompt = `
  Analyze this app idea: "${idea}".
  
  Provide:
  1. A catchy App Name.
  2. A short Tagline.
  3. An Executive Summary.
  4. A Maturity Assessment (score 0-100, verdict, gap analysis).
  5. A Logic Layer analysis (boundaries, assumptions, conflicts).
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      appName: { type: Type.STRING },
      tagline: { type: Type.STRING },
      executiveSummary: { type: Type.STRING },
      maturityAssessment: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          verdict: { type: Type.STRING, enum: ['Concept', 'Emerging', 'Mature', 'Production-Ready'] },
          gapAnalysis: { type: Type.STRING }
        }
      },
      logicLayer: {
        type: Type.OBJECT,
        properties: {
          inputBoundaries: {
            type: Type.OBJECT,
            properties: {
              analyzableScope: { type: Type.ARRAY, items: { type: Type.STRING } },
              outOfScope: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          assumptions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                statement: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER },
                riskLevel: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
              }
            }
          },
          detectedConflicts: {
             type: Type.ARRAY,
             items: {
                type: Type.OBJECT,
                properties: {
                   description: { type: Type.STRING },
                   severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                   resolutionSuggestion: { type: Type.STRING }
                }
             }
          }
        }
      }
    }
  };

  return generateStep<{ 
    appName: string; 
    tagline: string; 
    executiveSummary: string; 
    maturityAssessment: MaturityAssessment; 
    logicLayer: LogicLayer 
  }>(prompt, schema, "You are a Product Strategist.", true, 'gemini-3-pro-preview', 32768, lang);
};

export const generateUserScenarios = async (idea: string, analysisData: any, lang: Language) => {
  const prompt = `
  Context: ${analysisData.executiveSummary}
  
  Generate 3-5 critical User Scenarios (User Stories) for "${idea}".
  Include acceptance criteria and priority.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      scenarios: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            userStory: { type: Type.STRING },
            acceptanceCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
            priority: { type: Type.STRING, enum: ['Critical', 'High', 'Medium'] }
          }
        }
      }
    }
  };

  return generateStep<{ scenarios: Scenario[] }>(prompt, schema, "You are a UX Architect.", false, 'gemini-2.5-flash-lite', undefined, lang);
};

export const generateLogicFlow = async (scenarios: Scenario[], lang: Language) => {
  const prompt = `
  Based on these Scenarios: ${JSON.stringify(scenarios.map(s => s.userStory))}

  Task: Design the System Logic / Data Flow.
  1. Identify actual Inputs (User/API).
  2. Define Processes (Auth, Calculation, Parsing).
  3. Define Decisions (If/Else logic).
  4. Identify Databases & Outputs.
  
  IMPORTANT: Provide a connected graph. 
  - Assign a unique 'id' to each node (e.g., 'node-1', 'db-users').
  - Use these 'id' values in the 'connections' array to define the flow.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      logicFlow: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["Input", "Process", "Decision", "Output", "Database", "External API"] },
            connections: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    }
  };

  return generateStep<{ logicFlow: LogicNode[] }>(prompt, schema, "You are a Backend Systems Engineer. Create logical data maps.", false, 'gemini-3-pro-preview', 32768, lang);
};

export const generateUI = async (appName: string, scenarios: Scenario[], logicFlow: LogicNode[], lang: Language) => {
  const prompt = `
  App: ${appName}
  
  Design the UI System.
  1. Define a Color Palette & Typography (Design System).
  2. Create 3-4 Key UI Components (Blueprints) based on the scenarios.
  
  For each component, provide the HTML structure using Tailwind CSS classes in 'codeSnippet'.
  Ensure any text inside the UI mockups matches the requested language (${lang === 'ar' ? 'Arabic' : 'English'}).
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      designSystem: {
        type: Type.OBJECT,
        properties: {
          colorPalette: {
            type: Type.OBJECT,
            properties: {
              primary: { type: Type.STRING },
              secondary: { type: Type.STRING },
              background: { type: Type.STRING },
              text: { type: Type.STRING },
              accent: { type: Type.STRING }
            }
          },
          typography: {
            type: Type.OBJECT,
            properties: {
              fontFamilyHeadings: { type: Type.STRING },
              fontFamilyBody: { type: Type.STRING }
            }
          },
          layoutStrategy: { type: Type.STRING }
        }
      },
      uiBlueprints: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            codeSnippet: { type: Type.STRING },
            usageContext: { type: Type.STRING }
          }
        }
      }
    }
  };

  return generateStep<{ designSystem: DesignSystem; uiBlueprints: UIComponent[] }>(prompt, schema, "You are a UI/UX Designer.", false, 'gemini-2.5-flash-lite', undefined, lang);
};

export const generateTechStack = async (appName: string, logicFlow: LogicNode[], uiBlueprints: UIComponent[], lang: Language) => {
  const prompt = `
  Recommend a modern Tech Stack for ${appName}.
  Consider the logic flow and UI requirements.
  Suggest tools for Frontend, Backend, Database, and DevOps.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      techStack: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            tool: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            rejectedAlternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            riskAssessment: {
              type: Type.OBJECT,
              properties: {
                severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                mitigation: { type: Type.STRING }
              }
            },
            costComplexity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    }
  };

  return generateStep<{ techStack: TechStackItem[] }>(prompt, schema, "You are a CTO.", true, 'gemini-2.5-flash-lite', undefined, lang);
};

export const performFinalValidation = async (analysis: any, scenarios: any, logic: any, stack: any, lang: Language) => {
  const prompt = `
  Perform a final validation of the generated architecture for consistency, security, and feasibility.
  Identify potential issues.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      validationReport: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['Logic', 'Security', 'UX', 'Tech'] },
            severity: { type: Type.STRING, enum: ['Critical', 'Warning', 'Info'] },
            issue: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          }
        }
      }
    }
  };

  return generateStep<{ validationReport: ValidationIssue[] }>(prompt, schema, "You are a QA Architect.", false, 'gemini-2.5-flash-lite', undefined, lang);
};

export const generateConceptImage = async (prompt: string, size: '1K' | '2K' | '4K') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { 
          text: `A futuristic, high-tech, cyberpunk architectural concept art visualization for an application with the following description: ${prompt}. Cinematic lighting, neon accents, schematic overlays.` 
        },
      ],
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: "16:9"
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return undefined;
};