import { APIGatewayEvent, Handler } from 'aws-lambda';
import { badRequest, failure, success } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';
import { GeoFenceService } from '../../../../dbTransactions/geoFence-service';
import { GeoPointService } from '../../../../dbTransactions/geoPoint-service';
import { IpService } from '../../../../dbTransactions/ip-service';

export const upsertGeoFence: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const req = JSON.parse(event.body);
      const geoPoints = req.points;
      const geoFence = await GeoFenceService.upsert(req);

      //delete all existing points if any
      geoFence.points.forEach(async (p) => {
        await GeoPointService.deleteGeoPoint(p);
      });

      geoPoints.forEach(async (point, i) => {
        await GeoPointService.insert(i, geoFence, point);
      });
      return await success({ message: 'success', data: geoFence.id });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);
export const getGeoFences: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { size, page } = event.queryStringParameters || { size: 1000, page: 1 };
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

export const getWhiteListedIps: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { size, page } = event.queryStringParameters || { size: 1000, page: 1 };
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

export const toggleGeoFenceStatus: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { geoFenceId } = event.pathParameters;
      const fence = await GeoFenceService.getGeoFenceById(geoFenceId);
      if (typeof fence === 'undefined') {
        return await failure({ message: Error.toString() });
      }
      const toggleStatus = await GeoFenceService.toggleStatus(fence, geoFenceId);
      return await success({ message: 'success', data: 'Geo fence status updated successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const deleteGeoFenceById: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { geoFenceId } = event.pathParameters;
      const deleteGeoFence = await GeoFenceService.deleteGeoFenceById(geoFenceId);
      return await success({ message: 'success', data: 'Geo fence deleted successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const createWhiteListedIp: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const whitelistedIp = await IpService.insert(JSON.parse(event.body));
      return await success({ message: 'success', data: 'IP whitelisted successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const deleteWhiteListedIPById: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { ipId } = event.pathParameters;
      const deleteIP = await IpService.deleteWhiteListedIPById(ipId);
      return await success({ message: 'success', data: 'IP whitelisting deleted successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const updateWhiteListedIP: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { ipId } = event.pathParameters;
      const req = JSON.parse(event.body);
      const updateIP = await IpService.updateWhiteListedIP(ipId, req);
      return await success({ message: 'success', data: 'IP whitelisting updated successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const toggleWhiteListedIPStatus: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { ipId } = event.pathParameters;
      const ip = await IpService.getWhiteListedById(ipId);
      if (typeof ip === 'undefined') {
        return await failure({ message: Error.toString() });
      }
      const toggleStatus = await IpService.toggleStatus(ip, +ipId);
      return await success({ message: 'success', data: 'Ip status updated successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);
