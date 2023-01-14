import { APIGatewayEvent, Handler } from 'aws-lambda';
import { badRequest, failure, success } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';
import { ProductService } from '../../../../dbTransactions/product-service';
import { mapProductResponse } from '../../../../lib/response-map-lib/products';
import { result } from 'lodash';
import { ProductType } from '../../../../enums/ProductType';
import { ProductStatus } from '../../../../enums/ProductStatus';

export const getAllProducts: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { size, page } = event.queryStringParameters || { size: 100, page: 1 };
      const products = await ProductService.getAllProducts(+size, +page);
      return await success({
        message: 'success',
        data: products[0].map(mapProductResponse),
        totalCount: products[1],
        size,
        page,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getAllActiveProducts: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { size, page } = event.queryStringParameters || { size: 10, page: 1 };

      const products = await ProductService.getAllActiveProducts(+size, +page);
      return await success({
        message: 'success',
        data: products[0].map(mapProductResponse),
        totalCount: products[1],
        size,
        page,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const createProduct: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const toInsert = JSON.parse(event.body);
      toInsert.type = ProductType[toInsert.type];
      toInsert.status = ProductStatus[toInsert.status];
      const product = await ProductService.insert(toInsert);
      return await success({ message: 'success', data: product });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const deleteProductById: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { productId } = event.pathParameters;
      const product = await ProductService.deleteProductById(productId);
      return await success({ message: 'success', data: 'Product deleted successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getProductById: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { productId } = event.pathParameters;
      const product = await ProductService.getProductById(productId);
      //   const result = {
      //     type: ProductType[product.type],
      //     status: ProductStatus[product.status],
      //     ...product,
      //   };
      return await success({ message: 'success', data: product });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const updateProductById: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { productId } = event.pathParameters;
      const toUpdate = JSON.parse(event.body);
      toUpdate.status = ProductStatus[toUpdate.status];
      const product = await ProductService.updateProductById(productId, toUpdate);
      return await success({ message: 'success', data: 'Product updated successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);
