import { BusinessData, Review } from '../types';

export class GooglePlacesService {
  private envApiKey: string;
  private baseUrl = 'https://places.googleapis.com/v1/places';

  constructor() {
    // Fallback to environment variable if available
    this.envApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || '';
  }

  private getApiKey(overrideKey?: string): string {
    // STRICT TRIM: Removes whitespace AND quotes that cause Connection Failed errors
    return (overrideKey || this.envApiKey || '').replace(/['"]/g, '').trim();
  }

  // Step 1: Find the Place ID from a text query
  async searchPlaceId(query: string, apiKey?: string): Promise<string | null> {
    const key = this.getApiKey(apiKey);

    if (!key) {
      console.warn("Google Maps API Key missing. Cannot search.");
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}:searchText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'places.name,places.place_id,places.formattedAddress'
        },
        body: JSON.stringify({
          textQuery: query
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`Google Places Search Error (${response.status}):`, err);
        return null;
      }

      const data = await response.json();
      if (data.places && data.places.length > 0) {
        return data.places[0].name; // "places/PLACE_ID"
      }
      return null;
    } catch (error) {
      console.error("Error searching for place:", error);
      return null;
    }
  }

  // Step 2: Get Details
  async getPlaceDetails(resourceName: string, apiKey?: string): Promise<BusinessData | null> {
    const key = this.getApiKey(apiKey);
    if (!key) return null;

    try {
      // Correct URL: https://places.googleapis.com/v1/places/PLACE_ID
      // resourceName comes in as "places/PLACE_ID" usually.
      // The API endpoint is https://places.googleapis.com/v1/{name}
      // So strictly we just need base v1 + resourceName

      const url = `https://places.googleapis.com/v1/${resourceName}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          // Explicit Field Mask without spaces
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,reviews'
        }
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`Google Places Details Error (${response.status}):`, err);
        return null;
      }

      const data = await response.json();

      const reviews: Review[] = (data.reviews || []).map((r: any, index: number) => ({
        id: `g-rev-${index}`,
        author: r.authorAttribution?.displayName || 'Google User',
        rating: r.rating,
        text: r.text?.text || r.originalText?.text || '',
        date: r.publishTime || new Date().toISOString(),
        platform: 'Google'
      }));

      return {
        id: data.id,
        name: data.displayName?.text || 'Unknown Business',
        address: data.formattedAddress || '',
        totalReviews: data.userRatingCount || 0,
        averageRating: data.rating || 0,
        reviews: reviews,
        lastReviewDate: reviews.length > 0 ? reviews[0].date : new Date().toISOString(),
        knownProductsOrServices: [],
        isMock: false // Explicitly Real Data
      };

    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  }
}
