package in.xing.billingsoftware.service.impl;

import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import in.xing.billingsoftware.entity.OrderEntity;
import in.xing.billingsoftware.io.PaymentDetails;
import in.xing.billingsoftware.respository.OrderEntityRepository;
import in.xing.billingsoftware.service.WebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebhookServiceImpl implements WebhookService {
    private final OrderEntityRepository orderEntityRepository;

    @Override
    public void handleEvent(Event event, StripeObject stripeObject) {
        switch (event.getType()) {
            case "payment_intent.succeeded":
                updateOrder(event, stripeObject, PaymentDetails.PaymentStatus.COMPLETED);
            case "payment_intent.failed":
                updateOrder(event, stripeObject, PaymentDetails.PaymentStatus.FAILED);
        }

    }

    void updateOrder(Event event, StripeObject stripeObject, PaymentDetails.PaymentStatus targetStatus) {
        PaymentIntent pi = (PaymentIntent) stripeObject;
        OrderEntity existingOrder = orderEntityRepository.findByPaymentDetails_StripePaymentIntentId(pi.getId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
        PaymentDetails succeededPaymentDetails = existingOrder.getPaymentDetails();
        if (succeededPaymentDetails.getStatus() != targetStatus) {
            succeededPaymentDetails.setStatus(targetStatus);
            orderEntityRepository.save(existingOrder);
        }
    }
}
