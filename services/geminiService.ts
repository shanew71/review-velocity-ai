import { GoogleGenAI, Type } from "@google/genai";
import { Review, Tier, AnalysisResult } from '../types';

export class GeminiService {
  private ai: GoogleGenAI;
  private modelId = 'gemini-2.5-flash';
  private apiKey: string;

  constructor() {
    // The API key is injected from the environment
    // SANITIZATION: Strip quotes if user accidentally added them in .env
    this.apiKey = (process.env.API_KEY || '').replace(/['"]/g, '').trim();

    // DEBUG: Show what we're getting (first 10 chars only)
    console.log('🔍 DEBUG - API_KEY received:', this.apiKey.substring(0, 10) + '...', 'Length:', this.apiKey.length);

    if (!this.apiKey || this.apiKey === '') {
      console.error('❌ GEMINI API KEY MISSING: The API_KEY environment variable is not set.');
      throw new Error('Gemini API key is missing. Please add API_KEY to your .env.local file.');
    }

    if (!this.apiKey.startsWith('AIza')) {
      console.warn('⚠️ GEMINI API KEY FORMAT WARNING: The API key may be invalid (should start with "AIza").');
    }

    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
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

      let text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      // Robust JSON Extraction: Find first '{' and last '}'
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
      } else {
        // Fallback cleaning if braces aren't clear (unlikely with JSON schema but safe)
        text = text.replace(/```json\n?|\n?```/g, "").trim();
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

      // Check if it's an API key error
      if (error instanceof Error) {
        if (error.message.includes('API key not valid') || error.message.includes('INVALID_ARGUMENT')) {
          throw new Error('Invalid Gemini API key. Please check that API_KEY is correctly set in your .env.local file.');
        }
        if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
          throw new Error('Gemini API quota exceeded. Please check your API key limits.');
        }
      }

      throw new Error("Failed to generate AI analysis. Check console for details.");
    }
  }
}
