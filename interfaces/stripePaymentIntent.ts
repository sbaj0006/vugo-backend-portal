export interface IStripePaymentIntentRequest {
    description: string;
    amount: number;
    email: string;
    productName: string;
    userProductId: string;
    userId: string;
    productId: string;
  }