import { GeoFence } from '../db/entities/GeoFence';
export interface IGeoPoint {
  id: string;
  lat: string;
  lng: string;
  order: number;
  geoFence: GeoFence;
}
