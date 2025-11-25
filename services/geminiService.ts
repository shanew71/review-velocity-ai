import { GoogleGenAI, Type } from "@google/genai";
import { Review, Tier, AnalysisResult } from '../types';

export class GeminiService {
  private ai: GoogleGenAI;
  private modelId = 'gemini-2.5-flash';

  constructor() {
    // The API key is injected from the environment
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeReviews(businessName: string, reviews: Review[], knownServices: string[], tier: Tier): Promise<AnalysisResult> {
    if (!reviews || reviews.length === 0) {
      throw new Error("No reviews provided for analysis.");
    }

    // Limit reviews based on tier
    const reviewLimit = tier === 'CLIENT' ? 25 : 5;
    const recentReviews = reviews.slice(0, reviewLimit);

    const prompt = `
      You are an expert Reputation Manager AI for 'ReviewVelocity'.
      Analyze the following ${recentReviews.length} recent reviews for the business "${businessName}".

      CONTEXT - OFFICIAL SERVICE MENU (FROM GBP):
      ${JSON.stringify(knownServices)}
      
      REVIEWS DATA:
      ${JSON.stringify(recentReviews.map(r => ({ stars: r.rating, text: r.text, date: r.date })))}

      YOUR MISSION:
      Extract intelligence for a widget. You must differentiate between TANGIBLE PRODUCTS/SERVICES and ABSTRACT QUALITIES.

      RULES:
      1. 'services': MUST be tangible items that customers buy or book (e.g., "Espresso", "Implants", "Oil Change", "Pizza").
         - NEGATIVE CONSTRAINT: Do NOT use abstract words like "Service", "Quality", "Experience", "Professionalism", "Staff", "Dentistry" here. 
         - LOGIC: Match the reviews against the "Official Service Menu". If the reviews are vague, choose the most likely representatives from the "Official Service Menu".
         - QUANTITY: Aim for 5 items. However, if the data only strongly supports 2 or 3, return ONLY 2 or 3. Do not invent weak items just to hit the number 5.
      
      2. 'loves': This is where abstract qualities and vibes belong (e.g., "Friendly Staff", "Clean Atmosphere", "Great Vibe", "Fast Service", "Honest").
         - QUANTITY: Aim for 5 items. If 5 are not clearly present, return fewer.

      3. 'summary': A concise, professional 2-3 sentence summary of the overall sentiment.

      Return ONLY valid JSON matching the schema.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "2-3 sentence sentiment summary" },
              services: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Top 2-5 TANGIBLE services/products. Return fewer if data is weak."
              },
              loves: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Top 2-5 attributes/vibes. Return fewer if data is weak."
              }
            },
            required: ["summary", "services", "loves"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      const result = JSON.parse(text);

      return {
        summary: result.summary,
        services: result.services.slice(0, 5), // Allow up to 5
        loves: result.loves.slice(0, 5),       // Allow up to 5
        lastUpdated: Date.now(),
      };

    } catch (error) {
      console.error("Gemini Analysis Failed:", error);
      throw new Error("Failed to generate AI analysis.");
    }
  }
}