import { Product } from '../../db/entities/Product';
import { IProduct } from '../../interfaces/product';
import { ProductType } from '../../enums/ProductType';
import { ProductStatus } from '../../enums/ProductStatus';

export const mapProductResponse = (product: Product): IProduct => ({
  id: product.id,
  name: product.name,
  type: ProductType[product.type],
  status: ProductStatus[product.status],
  price: product.price,
  duration: product.duration,
  imageUrl: product.imageUrl,
  description: product.description,
});
