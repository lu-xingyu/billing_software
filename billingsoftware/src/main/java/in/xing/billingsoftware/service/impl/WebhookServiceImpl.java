package in.xing.billingsoftware.service.impl;

import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import in.xing.billingsoftware.controller.WebhookController;
import in.xing.billingsoftware.entity.OrderEntity;
import in.xing.billingsoftware.io.PaymentDetails;
import in.xing.billingsoftware.respository.OrderEntityRepository;
import in.xing.billingsoftware.service.WebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
@RequiredArgsConstructor
public class WebhookServiceImpl implements WebhookService {

    private static final Logger log = LoggerFactory.getLogger(WebhookServiceImpl.class);
    private final OrderEntityRepository orderEntityRepository;

    @Override
    public void handleEvent(Event event, StripeObject stripeObject) {
        switch (event.getType()) {
            case "payment_intent.succeeded":
                updateOrder(stripeObject, PaymentDetails.PaymentStatus.COMPLETED);
                break;
            case "payment_intent.payment_failed":
                updateOrder(stripeObject, PaymentDetails.PaymentStatus.FAILED);
                break;
        }

    }

    void updateOrder(StripeObject stripeObject, PaymentDetails.PaymentStatus targetStatus) {
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
