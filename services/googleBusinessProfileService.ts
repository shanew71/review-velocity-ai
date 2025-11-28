import { BusinessData } from '../types';

export interface GBPAccount {
    name: string; // "accounts/123456"
    accountName: string; // "John's Business Group"
    type: string;
}

export interface GBPLocation {
    name: string; // "accounts/123/locations/456"
    title: string; // "Snow Family Dentistry"
    storeCode?: string;
    placeId?: string; // Added placeId
}

export class GoogleBusinessProfileService {
    private baseUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1';
    private accountUrl = 'https://mybusinessaccountmanagement.googleapis.com/v1';

    async listAccounts(accessToken: string): Promise<GBPAccount[]> {
        try {
            const response = await fetch(`${this.accountUrl}/accounts`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Failed to list accounts:', await response.text());
                return [];
            }

            const data = await response.json();
            return data.accounts || [];
        } catch (error) {
            console.error('Error listing accounts:', error);
            return [];
        }
    }

    async listLocations(accessToken: string, accountName: string): Promise<GBPLocation[]> {
        try {
            // accountName is like "accounts/12345"
            // Added metadata to readMask to get placeId
            const response = await fetch(`${this.baseUrl}/${accountName}/locations?readMask=name,title,storeCode,metadata`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Failed to list locations:', await response.text());
                return [];
            }

            const data = await response.json();
            return (data.locations || []).map((loc: any) => ({
                name: loc.name,
                title: loc.title,
                storeCode: loc.storeCode,
                placeId: loc.metadata?.placeId // Extract placeId from metadata
            }));
        } catch (error) {
            console.error('Error listing locations:', error);
            return [];
        }
    }
}
