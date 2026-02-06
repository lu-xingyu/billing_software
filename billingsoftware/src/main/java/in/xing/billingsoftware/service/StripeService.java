package in.xing.billingsoftware.service;

import com.stripe.exception.StripeException;
import in.xing.billingsoftware.io.StripePaymentIntentResponse;

public interface StripeService {

    StripePaymentIntentResponse createPaymentIntent(String orderId, Double amount, String currency) throws StripeException;
}
