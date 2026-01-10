package in.xing.billingsoftware.service.impl;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.model.billingportal.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import in.xing.billingsoftware.io.StripePaymentIntentResponse;
import com.stripe.exception.StripeException;
import in.xing.billingsoftware.service.StripeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class StripeServiceImpl implements StripeService {

    @Value("${stripe_secret_key}")
    private String stripe_secret_key;

    @Override
    public StripePaymentIntentResponse createPaymentIntent(Double amount, String currency) throws StripeException {
        Stripe.apiKey = stripe_secret_key;
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(Math.round(amount * 100))
                .setCurrency(currency.toLowerCase())
                .putMetadata("receipt", "order_rcptid_" + System.currentTimeMillis())
                .build();
        PaymentIntent paymentIntent = PaymentIntent.create(params);
        return convertToResponse(paymentIntent);
    }

    private StripePaymentIntentResponse convertToResponse(PaymentIntent paymentIntent) {
        return StripePaymentIntentResponse.builder()
                .id(paymentIntent.getId())
                .entity(paymentIntent.getObject())
                .currency(paymentIntent.getCurrency())
                .status(paymentIntent.getStatus())
                .created_at(new Date(paymentIntent.getCreated() * 1000))
                .receipt(paymentIntent.getMetadata().get("receipt"))
                .client_secret(paymentIntent.getClientSecret())
                .build();
    }


    @Override
    public StripeCheckoutSessionResponse createCheckoutSession(
            Double amount,
            String currency,
            String orderId
    ) throws StripeException {

        Stripe.apiKey = stripe_secret_key;

        SessionCreateParams params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl("https://your-site/success?session_id={CHECKOUT_SESSION_ID}")
            .setCancelUrl("https://your-site/cancel?orderId=" + orderId)
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setQuantity(1L)
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency(currency.toLowerCase())
                            .setUnitAmount(Math.round(amount * 100))
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName("Order " + orderId)
                                    .build()
                            )
                            .build()
                    )
                    .build()
            )
            .putMetadata("orderId", orderId)
            .build();

        Session session = Session.create(params);

        return new StripeCheckoutSessionResponse(
                session.getId(),
                session.getUrl()
        );
    }

}
