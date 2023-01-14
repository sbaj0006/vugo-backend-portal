import { Product } from '../../db/entities/Product';
import { GeoPoint } from '../../db/entities/GeoPoint';
import { IGeoPoint } from '../../interfaces/geoPoint';

export const mapGeoPointResponse = (geoPoint: GeoPoint): IGeoPoint => ({
  id: geoPoint.id,
  lat: geoPoint.lat,
  lng: geoPoint.lng,
  order: geoPoint.order,
  geoFence: geoPoint.geoFence,
});
