import { APIGatewayEvent, Handler } from 'aws-lambda';
import { badRequest, failure, success } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';
import { ProductService } from '../../../../dbTransactions/product-service';
import { mapProductResponse } from '../../../../lib/response-map-lib/products';
import { UserService } from '@dbTransactions/user-service';
import { UserProductService } from '@dbTransactions/user-product-service';
import { createPaymentIntent } from '@lib/stripe-lib'

export const getAllProducts: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { size, page } = event.queryStringParameters || { size: 10, page: 1 };
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

export const purchaseProduct: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { email, productId } = event.queryStringParameters
      if(!email || !productId)
        return await failure({ message: 'Invalid params'})
      let user = await UserService.getUserByEmail(email);
      if(!user){
        user = await UserService.createUser({
          email
        })
        //need to add hashed password, for the default password
      }
      let existingProduct = await UserProductService.getUserProductByUser(user.id)
      if( existingProduct.length > 0 ){
        return await failure({ message: "The user has already purchased a product" });
      }

      const userProduct = await UserProductService.createUserProduct(user.id, productId)
      const product = await ProductService.get(productId)

      const paymentIntent = await createPaymentIntent({
        description: `User ${email} purchased ${product.name}`,
        amount: product.price,
        email: user.email,
        productName: product.name,
        userProductId: userProduct.id,
        userId: user.id,
        productId: productId
      }, {
        apiKey: process.env.STRIPE_API_KEY,
        idempotencyKey: userProduct.id
      })
      const purchaseProductResource ={
          email,
          UserProduct: userProduct,
          PaymentIntent:paymentIntent
      }
      return success(purchaseProductResource);
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true
);
