package in.xing.billingsoftware.controller;

import com.stripe.exception.StripeException;
import in.xing.billingsoftware.io.OrderResponse;
import in.xing.billingsoftware.io.PaymentRequest;
import in.xing.billingsoftware.io.PaymentVerificationRequest;
import in.xing.billingsoftware.io.StripePaymentIntentResponse;
import in.xing.billingsoftware.service.OrderService;
import in.xing.billingsoftware.service.StripeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final StripeService stripeService;
    private final OrderService orderService;

    @PostMapping("/payment-intent")
    @ResponseStatus(HttpStatus.CREATED)
    public StripePaymentIntentResponse createStripeOrder(@RequestBody PaymentRequest request) throws StripeException {
        return stripeService.createPaymentIntent(request.getOrderId(), request.getAmount(), request.getCurrency());
    }


    @PostMapping("/verify")
    public OrderResponse verifyPayment(@RequestBody PaymentVerificationRequest request) {
        return orderService.verifyPayment(request);
    }
}
