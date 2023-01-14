import * as Stripe from 'stripe'
import { IStripePaymentIntentRequest } from '@interfaces/stripePaymentIntent';
const stripe = new Stripe.Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2020-08-27',
  typescript: true,
  maxNetworkRetries: 5,
})

export const createPaymentIntent = async (request: IStripePaymentIntentRequest, option: Object): Promise<object> =>{

  return stripe.paymentIntents.create({
    amount: request.amount,
    currency: 'USD',
    payment_method_types: ['card'],
    receipt_email: request.email,
    metadata:{
      userId: request.userId,
      userProductId: request.userProductId,
      dateTime: Date.now().toString(),
      productId: request.productId,
      productName: request.productName
    },
    description: request.description
  }, option)
}