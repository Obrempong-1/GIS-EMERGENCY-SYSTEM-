import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface RouteRequest {
    origin_lat: number;
    origin_lon: number;
    dest_lat: number;
    dest_lon: number;
    mode?: 'shortest' | 'fastest';
    transport_mode?: 'drive' | 'walk' | 'bike';
    traffic_level?: 'low' | 'normal' | 'heavy';
}

export interface RouteResponse {
    mode: string;
    transport_mode: string;
    traffic_level: string;
    distance_km: number;
    time_min: number;
    path: [number, number][]; // Array of [lat, lon]
    instructions: string[];
}

export const api = {
    getLocations: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/locations`);
            return response.data;
        } catch (error) {
            console.error("API Error (getLocations):", error);
            throw error;
        }
    },
    calculateRoute: async (params: RouteRequest): Promise<RouteResponse> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/route`, params);
            return response.data;
        } catch (error) {
            console.error("API Error (calculateRoute):", error);
            throw error;
        }
    }
};
