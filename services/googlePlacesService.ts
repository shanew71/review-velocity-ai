import { BusinessData, Review } from '../types';

// Defines the structure of the raw Google Places API response
interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating: number;
  user_ratings_total: number;
  reviews?: {
    author_name: string;
    rating: number;
    text: string;
    time: number; // Unix timestamp
    relative_time_description: string;
  }[];
}

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://places.googleapis.com/v1/places';

  constructor() {
    // Access the API key from environment variables
    // Use VITE_ prefix for client-side access in Vite
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || ''; 
  }

  // Step 1: Find the Place ID from a text query (e.g. "Joe's Pizza NYC")
  async searchPlaceId(query: string): Promise<string | null> {
    if (!this.apiKey) {
        console.warn("Google Maps API Key missing. Returning null.");
        return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}:searchText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.name,places.place_id,places.formattedAddress'
        },
        body: JSON.stringify({
          textQuery: query
        })
      });

      const data = await response.json();
      if (data.places && data.places.length > 0) {
        return data.places[0].name; // In new Places API, 'name' is the resource name like "places/PLACE_ID"
      }
      return null;
    } catch (error) {
      console.error("Error searching for place:", error);
      return null;
    }
  }

  // Step 2: Get Details (Reviews, Rating) using the Resource Name
  async getPlaceDetails(resourceName: string): Promise<BusinessData | null> {
    if (!this.apiKey) return null;

    try {
      const response = await fetch(`https://places.googleapis.com/v1/${resourceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,reviews'
        }
      });

      const data = await response.json();
      
      // Transform Google API format to our App's internal format
      const reviews: Review[] = (data.reviews || []).map((r: any, index: number) => ({
        id: `g-rev-${index}`,
        author: r.authorAttribution?.displayName || 'Google User',
        rating: r.rating,
        text: r.text?.text || '',
        date: r.publishTime || new Date().toISOString(), // Use publishTime if available
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
        knownProductsOrServices: [] // We will let the AI infer this from reviews since Places API doesn't easily give a menu
      };

    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  }
}
