import { APIGatewayEvent, Handler } from 'aws-lambda';
import { badRequest, failure, success } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';
import { GeoFenceService } from '../../../../dbTransactions/geoFence-service';
import { IpService } from '../../../../dbTransactions/ip-service';

export const getGeoFence: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { size, page } = event.queryStringParameters || { size: 10, page: 1 };
      const geoFence = await GeoFenceService.getGeoFences(+size, +page);
      return await success({
        message: 'success',
        data: geoFence[0],
        totalCount: geoFence[1],
        size,
        page,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getWhiteListedIp: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { size, page } = event.queryStringParameters || { size: 10, page: 1 };
      const ips = await IpService.getWhiteListedIp(+size, +page);
      return await success({
        message: 'success',
        data: ips[0],
        totalCount: ips[1],
        size,
        page,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const inInValidZoneOrIp: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const req = JSON.parse(event.body);
      if ((req.lat && req.lng) || req.ip) {
        let data = await GeoFenceService.getGeoFences();
        console.log('ggg', data[0]);
        let geoFences = data[0];

        let point = {
          lat: req.lat,
          lng: req.lng,
        };

        let isInside = false;
        const polygon = [];

        for (let j = 0; j < geoFences.length; j++) {
          if (!geoFences[j].active) continue;

          for (let i = 0; i < geoFences[j].points.length; i++) {
            let poly = {
              lat: null,
              lng: null,
            };
            let lat = geoFences[j].points[i].lat;
            let lng = geoFences[j].points[i].lng;

            poly.lat = lat.toString();
            poly.lng = lng.toString();
            polygon.push(poly);
          }

          isInside = isPointInPolygon(point, polygon);

          if (isInside) {
            break;
          }
        }

        const foundIp = await IpService.checkIp(req.ip);
        if (isInside || foundIp) var valid = true;

        const result = {
          isInZone: isInside,
          isWhiteListedIp: foundIp ? true : false,
          result: valid ? true : false,
        };

        return await success({ data: result });
      }
      const data = {
        result: false,
      };
      return await failure({ message: data });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

function isPointInPolygon(point, polygon) {
  let minX = polygon[0].lat;
  let maxX = polygon[0].lat;
  let minY = polygon[0].lng;
  let maxY = polygon[0].lng;

  for (var i = 1; i < polygon.length; i++) {
    var q = polygon[i];
    minX = Math.min(q.lat, minX);
    maxX = Math.max(q.lat, maxX);
    minY = Math.min(q.lng, minY);
    maxY = Math.max(q.lng, maxY);
  }

  if (point.lat < minX || point.lat > maxX || point.lng < minY || point.lng > maxY) {
    return false;
  }

  var inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (
      polygon[i].lng > point.lng != polygon[j].lng > point.lng &&
      point.lat <
        ((polygon[j].lat - polygon[i].lat) * (point.lng - polygon[i].lng)) /
          (polygon[j].lng - polygon[i].lng) +
          polygon[i].lat
    ) {
      inside = true;
    }
  }
  return inside;
}
