package in.xing.billingsoftware.service.impl;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.model.billingportal.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import in.xing.billingsoftware.entity.OrderEntity;
import in.xing.billingsoftware.io.PaymentDetails;
import in.xing.billingsoftware.io.StripePaymentIntentResponse;
import com.stripe.exception.StripeException;
import in.xing.billingsoftware.respository.OrderEntityRepository;
import in.xing.billingsoftware.service.StripeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class StripeServiceImpl implements StripeService {

    private final OrderEntityRepository orderEntityRepository;
    @Value("${stripe_secret_key}")
    private String stripe_secret_key;

    @Override
    public StripePaymentIntentResponse createPaymentIntent(String orderId, Double amount, String currency) throws StripeException {
        Stripe.apiKey = stripe_secret_key;
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(Math.round(amount * 100))
                .setCurrency(currency.toLowerCase())
                .putMetadata("receipt", "order_rcptid_" + System.currentTimeMillis())
                .putMetadata("orderId", orderId)
                .build();
        PaymentIntent paymentIntent = PaymentIntent.create(params);

        OrderEntity existingOrder = orderEntityRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        PaymentDetails paymentDetails = existingOrder.getPaymentDetails();
        paymentDetails.setStripePaymentIntentId(paymentIntent.getId());
        existingOrder = orderEntityRepository.save(existingOrder);
        return convertToResponse(paymentIntent, existingOrder);
    }

    private StripePaymentIntentResponse convertToResponse(PaymentIntent paymentIntent, OrderEntity existingOrder) {
        return StripePaymentIntentResponse.builder()
                .id(paymentIntent.getId())
                .entity(paymentIntent.getObject())
                .currency(paymentIntent.getCurrency())
                .amount(paymentIntent.getAmount() / 100)
                .status(paymentIntent.getStatus())
                .created_at(new Date(paymentIntent.getCreated() * 1000))
                .receipt(paymentIntent.getMetadata().get("receipt"))
                .client_secret(paymentIntent.getClientSecret())
                .orderId(existingOrder.getOrderId())
                .build();
    }

}
