export type Tier = 'PROSPECT' | 'CLIENT';

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string; // ISO Date string
  platform: 'Google' | 'Yelp' | 'Facebook';
}

export interface BusinessData {
  id: string;
  name: string;
  address: string;
  totalReviews: number;
  averageRating: number;
  reviews: Review[];
  lastReviewDate: string; // ISO Date string
  knownProductsOrServices: string[]; // Simulates GBP Service/Menu List
}

export interface AnalysisResult {
  summary: string;
  services: string[];
  loves: string[];
  lastUpdated: number; // Timestamp
}

export interface WidgetState {
  businessData: BusinessData | null;
  analysis: AnalysisResult | null;
  tier: Tier;
  loading: boolean;
  analyzing: boolean;
  error: string | null;
}

export interface AIConfig {
  apiKey: string;
}