export const CACHE_KEYS = {
  METRICS_UPDATE: 'rv_metrics_last_update',
  AI_ANALYSIS: 'rv_ai_analysis',
  BUSINESS_DATA: 'rv_business_data',
};

// Update intervals in milliseconds
export const UPDATE_INTERVALS = {
  METRICS: 24 * 60 * 60 * 1000, // 24 hours
  AI: 7 * 24 * 60 * 60 * 1000,    // 7 days
};

export const MOCK_BUSINESSES = [
  {
    id: 'b1',
    name: 'Apex Coffee Roasters',
    address: '123 Market St, San Francisco, CA',
    avgRating: 4.8,
    count: 142,
    products: ['Pour-over Coffee', 'Avocado Toast', 'Oat Milk Latte', 'Cold Brew', 'Croissants', 'Espresso Flight']
  },
  {
    id: 'b2',
    name: 'Modern Dental Studio',
    address: '450 Sutter St, San Francisco, CA',
    avgRating: 4.9,
    count: 89,
    products: ['Invisalign', 'Teeth Whitening', 'Dental Implants', 'Veneers', 'Root Canal', 'Emergency Exam']
  },
];