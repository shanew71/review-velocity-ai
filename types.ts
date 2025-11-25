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
  isMock?: boolean; // Flag to indicate if data is simulated
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

// Google Identity Services (OAuth) Types
export interface TokenClient {
  requestAccessToken: () => void;
}

export interface TokenResponse {
  access_token: string;
  error?: string;
  expires_in: string;
  scope: string;
  token_type: string;
}

export interface GoogleAccountsOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: any) => void;
  }) => TokenClient;
}

export interface GoogleAccounts {
  oauth2: GoogleAccountsOAuth2;
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}