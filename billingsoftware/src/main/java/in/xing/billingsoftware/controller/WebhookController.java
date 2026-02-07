package in.xing.billingsoftware.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import in.xing.billingsoftware.service.WebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequiredArgsConstructor
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);
    @Value("${stripe.webhook.secret}")
    private String webhook_secret;
    private final WebhookService webhookService;

    @PostMapping("/webhook")
    public ResponseEntity handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhook_secret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = deserializer.getObject().orElse(null);

        if (stripeObject == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot deserialize object");
        }

        try {
            webhookService.handleEvent(event, stripeObject);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (RuntimeException e) {
            log.info("Service error {}", e);
            return ResponseEntity.status(HttpStatus.OK).build();
        }
    }
}
