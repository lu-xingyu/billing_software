package in.xing.billingsoftware.service;

import com.stripe.model.Event;
import com.stripe.model.StripeObject;

public interface WebhookService {
    void handleEvent(Event event, StripeObject stripeObject);
}
