import { BusinessData, Review, Tier, AnalysisResult } from '../types';
import { CACHE_KEYS, UPDATE_INTERVALS, MOCK_BUSINESSES } from '../constants';
import { GeminiService } from './geminiService';
import { GooglePlacesService } from './googlePlacesService';

// Mock Data Generator
const generateMockReviews = (count: number, businessName: string, densityMultiplier: number = 1): Review[] => {
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
    // Density Logic: 
    // If multiplier is small (0.5), reviews are closer together (high velocity).
    // If multiplier is large (2), reviews are spread out.
    date.setDate(date.getDate() - (i * densityMultiplier)); 
    
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

  async fetchBusinessData(businessId: string, tier: Tier, customQuery: string = '', apiKey: string = ''): Promise<BusinessData> {
    
    // If custom query AND api key present (or environment has it)
    if (customQuery && (apiKey || process.env.VITE_GOOGLE_MAPS_API_KEY)) {
        console.log(`Processing Query: ${customQuery}`);
        
        let resourceName: string | null = null;

        // SMART DETECTION: Check if input looks like a Place ID (Starts with ChIJ and no spaces)
        if (customQuery.startsWith('ChIJ') && !customQuery.includes(' ')) {
             console.log("Detected Place ID format. Fetching directly...");
             resourceName = `places/${customQuery}`;
        } else if (customQuery.startsWith('places/')) {
             resourceName = customQuery;
        } else {
             // Fallback to Text Search
             console.log("Detected Text Search. Querying API...");
             resourceName = await this.placesService.searchPlaceId(customQuery, apiKey);
        }
        
        if (resourceName) {
            const realData = await this.placesService.getPlaceDetails(resourceName, apiKey);
            if (realData) {
                console.log("Successfully fetched LIVE data.");
                return { ...realData, isMock: false };
            }
        }
        console.warn("Google Places lookup failed or no key provided. Falling back to mock.");
    }

    // FALLBACK MOCK
    await new Promise(resolve => setTimeout(resolve, 800)); 
    const isClient = tier === 'CLIENT';
    
    // Find mock definition or create generic one from ID
    const mockDef = MOCK_BUSINESSES.find(b => b.id === businessId) || {
        id: businessId,
        name: businessId === 'ChIJUQvj6h-vK4cRVPaPZQIQOl0' ? 'Snow Family Dentistry' : 'Demo Business',
        address: businessId === 'ChIJUQvj6h-vK4cRVPaPZQIQOl0' ? '4420 E Baseline Rd #111, Mesa, AZ 85206' : '123 Main St',
        avgRating: 4.8,
        count: 100,
        products: ['Dental Implants', 'Cosmetic Dentistry', 'Invisalign']
    };
    
    // MOCK DATA STRATEGY:
    // Prospecting Mode: 10 reviews, spread out (2 days apart). Velocity ~5/mo.
    // Client Mode: 60 reviews, dense (0.5 days apart). Velocity ~40-50/mo.
    // This proves that we can analyze 25 reviews but report velocity of 50.
    const reviewCount = isClient ? 60 : 10;
    const density = isClient ? 0.5 : 2;

    const mockReviews = generateMockReviews(reviewCount, mockDef.name, density);

    return {
      id: businessId,
      name: mockDef.name,
      address: mockDef.address,
      totalReviews: isClient ? 142 : mockDef.count,
      averageRating: mockDef.avgRating,
      reviews: mockReviews,
      lastReviewDate: new Date().toISOString(),
      knownProductsOrServices: mockDef.products,
      isMock: true
    };
  }

  async getWidgetData(businessId: string, tier: Tier, customQuery: string = '', apiKey: string = ''): Promise<{ data: BusinessData, analysis: AnalysisResult | null }> {
    // Cache key includes customQuery to differentiate searches
    const storageKeyMetrics = `${CACHE_KEYS.BUSINESS_DATA}_${businessId}_${customQuery}`;
    const storageKeyAI = `${CACHE_KEYS.AI_ANALYSIS}_${businessId}_${tier}`; 
    
    const cachedMetricsJson = localStorage.getItem(storageKeyMetrics);
    let businessData: BusinessData | null = null;
    
    if (cachedMetricsJson) {
      const parsed = JSON.parse(cachedMetricsJson);
      
      // CRITICAL: If we now have an API key, but the cache is MOCK data, ignore the cache to try and get real data.
      const shouldInvalidateMock = apiKey && parsed.data.isMock === true;
      
      if (!shouldInvalidateMock && Date.now() - parsed.timestamp < UPDATE_INTERVALS.METRICS) {
        businessData = parsed.data;
        console.log("Serving from Cache (Is Mock:", businessData?.isMock, ")");
      } else {
        console.log("Cache invalid or upgrade to Live Data requested.");
      }
    }

    if (!businessData) {
      businessData = await this.fetchBusinessData(businessId, tier, customQuery, apiKey);
      localStorage.setItem(storageKeyMetrics, JSON.stringify({
        timestamp: Date.now(),
        data: businessData
      }));
    }

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