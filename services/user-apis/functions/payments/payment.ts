import { STRIPE_EVENTS } from '@/constants/stripe-events';
import { UserProductPaymentIntent } from '@/db/entities/UserProductPaymentIntent';
import { StripePaymentIntentStatus } from '@/enums/StripePaymentIntentStatus';
import { UserProductPaymentService } from '@dbTransactions/user-product-payment-service';
import { badRequest, success } from '@lib/response-lib';
import { APIGatewayEvent, Handler } from 'aws-lambda';

export const webhookHandler: Handler = async (event: APIGatewayEvent) => {
  let stripeEvent;
  try {
    stripeEvent = JSON.parse(event.body);
  } catch (err) {
    return await badRequest(`Webhook Error: ${err.message}`);
  }

  //handle stripe events
  switch (stripeEvent.type) {
    case STRIPE_EVENTS.created:
    case STRIPE_EVENTS.processing:
    case STRIPE_EVENTS.paymentFailure:
    case STRIPE_EVENTS.canceled:
    case STRIPE_EVENTS.succeeded:
      const paymentIntent = stripeEvent.data.object;
      const userProductId = paymentIntent.metadata['User.Product.Id'];

      if (userProductId == null) {
        return await badRequest('Payment intent does not contain expected metadata: User.Product.Id');
      }

      const getPaymentStatus = (eventType: string): StripePaymentIntentStatus => {
        if (eventType === STRIPE_EVENTS.created) return StripePaymentIntentStatus.Created;
        if (eventType === STRIPE_EVENTS.processing) return StripePaymentIntentStatus.Processing;
        if (eventType === STRIPE_EVENTS.paymentFailure) return StripePaymentIntentStatus.PaymentFailed;
        if (eventType === STRIPE_EVENTS.canceled) return StripePaymentIntentStatus.Cancelled;
        if (eventType === STRIPE_EVENTS.succeeded) return StripePaymentIntentStatus.Succeeded;
      };

      const userProductPaymentIntent = {
        userProductId: userProductId,
        paymentIntentStatus: getPaymentStatus(stripeEvent.type),
        dateTime: new Date(),
      };

      const result = await UserProductPaymentService.insertUserProductPaymentIntent(
        <UserProductPaymentIntent>userProductPaymentIntent,
      );
      break;

    // ... handle other event types, for now we don't have any other types to handle
    default:
      return await badRequest('Unexpected event type');
  }

  return await success(null);
};
