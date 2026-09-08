import type { CareLinkSupabaseClient } from '../client';
import { calculateDistanceKm } from '@carelink/shared';

export type NearbyHealthFacility = {
  id: string; name: string; facility_type: string; address: string; district: string | null; city: string;
  phone: string | null; latitude: number; longitude: number; emergency_available: boolean; distance_km: number;
};

export type NearbyPharmacy = {
  id: string; name: string; address: string; district: string | null; city: string; phone: string;
  latitude: number; longitude: number; is_duty_pharmacy: boolean; distance_km: number;
};

export class LocationService {
  constructor(private client: CareLinkSupabaseClient) {}

  async getNearbyHealthFacilities(latitude: number, longitude: number, radiusKm = 25) {
    const { data, error } = await this.client.rpc('get_nearby_health_facilities', {
      p_latitude: latitude, p_longitude: longitude, p_radius_km: radiusKm, p_limit: 50, p_facility_type: null,
    });
    if (error) throw error;
    return (data ?? []) as NearbyHealthFacility[];
  }

  async getNearbyPharmacies(latitude: number, longitude: number, radiusKm = 25) {
    const { data, error } = await this.client.rpc('get_nearby_pharmacies', {
      p_latitude: latitude, p_longitude: longitude, p_radius_km: radiusKm, p_limit: 50,
    });
    if (error) throw error;
    return (data ?? []) as NearbyPharmacy[];
  }

  static browserPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('La géolocalisation n’est pas disponible sur cet appareil.'));
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });
  }

  static distance(latitude: number, longitude: number, targetLatitude: number, targetLongitude: number) {
    return calculateDistanceKm(latitude, longitude, targetLatitude, targetLongitude);
  }
}
