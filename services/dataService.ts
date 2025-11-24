import { BusinessData, Review, Tier, AnalysisResult } from '../types';
import { CACHE_KEYS, UPDATE_INTERVALS, MOCK_BUSINESSES } from '../constants';
import { GeminiService } from './geminiService';
import { GooglePlacesService } from './googlePlacesService';

// Mock Data Generator for "Prospecting" Simulation (Fallback)
const generateMockReviews = (count: number, businessName: string): Review[] => {
  const templates = [
    { text: `Absolutely love ${businessName}! The team is fantastic.`, rating: 5 },
    { text: "Great experience, but the wait time was a bit long.", rating: 4 },
    { text: "Best service in town. Highly recommend to everyone.", rating: 5 },
    { text: "Professional and clean. Will come again.", rating: 5 },
    { text: "A bit pricey, but worth it for the quality.", rating: 4 },
    { text: "Exceptional attention to detail.", rating: 5 },
    { text: "Friendly staff made my day.", rating: 5 },
    { text: "Not what I expected, could be improved.", rating: 3 },
    { text: "Incredible value!", rating: 5 },
    { text: "Just okay.", rating: 3 }
  ];

  return Array.from({ length: count }).map((_, i) => {
    const temp = templates[i % templates.length];
    const date = new Date();
    date.setDate(date.getDate() - (i * 2)); // Spread dates back
    return {
      id: `rev-${i}`,
      author: `Customer ${i + 1}`,
      rating: temp.rating,
      text: temp.text,
      date: date.toISOString(),
      platform: 'Google'
    };
  });
};

export class DataService {
  private geminiService: GeminiService;
  private placesService: GooglePlacesService;

  constructor() {
    this.geminiService = new GeminiService();
    this.placesService = new GooglePlacesService();
  }

  // Simulates fetching fresh data from Google Business Profile or Places API
  async fetchBusinessData(businessId: string, tier: Tier, customQuery: string = ''): Promise<BusinessData> {
    
    // If a custom search query is provided (Real Data Mode)
    if (customQuery) {
        console.log(`Searching Google Places for: ${customQuery}`);
        
        // 1. Find Place ID
        const resourceName = await this.placesService.searchPlaceId(customQuery);
        
        // 2. Get Details if found
        if (resourceName) {
            const realData = await this.placesService.getPlaceDetails(resourceName);
            if (realData) {
                return realData;
            }
        }
        console.warn("Google Places lookup failed or returned no results. Falling back to mock.");
    }

    // FALLBACK / DEMO MODE
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency

    const isClient = tier === 'CLIENT';
    const reviewCount = isClient ? 124 : 45; 
    
    // Find mock definition or create generic one from ID
    const mockDef = MOCK_BUSINESSES.find(b => b.id === businessId) || {
        id: businessId,
        name: businessId === 'b1' || businessId === 'b2' ? 'Demo Business' : businessId, // Handle custom text fallback
        address: '123 Main St',
        avgRating: 4.5,
        count: 100,
        products: ['Product A', 'Product B']
    };
    
    const mockReviews = generateMockReviews(isClient ? 50 : 10, mockDef.name);

    return {
      id: businessId,
      name: mockDef.name,
      address: mockDef.address,
      totalReviews: reviewCount,
      averageRating: mockDef.avgRating,
      reviews: mockReviews,
      lastReviewDate: new Date().toISOString(),
      knownProductsOrServices: mockDef.products
    };
  }

  // Handles the Caching Logic: 24h for Metrics, 7d for AI
  async getWidgetData(businessId: string, tier: Tier, customQuery: string = ''): Promise<{ data: BusinessData, analysis: AnalysisResult | null }> {
    const storageKeyMetrics = `${CACHE_KEYS.BUSINESS_DATA}_${businessId}`;
    const storageKeyAI = `${CACHE_KEYS.AI_ANALYSIS}_${businessId}_${tier}`; 
    
    // 1. Check Metrics Cache
    const cachedMetricsJson = localStorage.getItem(storageKeyMetrics);
    let businessData: BusinessData | null = null;
    
    if (cachedMetricsJson) {
      const parsed = JSON.parse(cachedMetricsJson);
      if (Date.now() - parsed.timestamp < UPDATE_INTERVALS.METRICS) {
        businessData = parsed.data;
      }
    }

    // If no valid cache, fetch fresh
    if (!businessData) {
      businessData = await this.fetchBusinessData(businessId, tier, customQuery);
      localStorage.setItem(storageKeyMetrics, JSON.stringify({
        timestamp: Date.now(),
        data: businessData
      }));
    }

    // 2. Check AI Cache
    const cachedAIJson = localStorage.getItem(storageKeyAI);
    let analysis: AnalysisResult | null = null;

    if (cachedAIJson) {
      const parsed = JSON.parse(cachedAIJson);
      if (Date.now() - parsed.lastUpdated < UPDATE_INTERVALS.AI) {
        analysis = parsed;
      }
    }

    return { data: businessData, analysis };
  }

  async runAnalysis(businessData: BusinessData, tier: Tier): Promise<AnalysisResult> {
    console.log("Running expensive Gemini analysis...");
    
    const analysis = await this.geminiService.analyzeReviews(
      businessData.name, 
      businessData.reviews, 
      businessData.knownProductsOrServices,
      tier
    );
    
    const storageKeyAI = `${CACHE_KEYS.AI_ANALYSIS}_${businessData.id}_${tier}`;
    localStorage.setItem(storageKeyAI, JSON.stringify(analysis));
    
    return analysis;
  }

  clearCache() {
    localStorage.clear();
  }
}
