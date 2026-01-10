package in.xing.billingsoftware.io;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentVerificationRequest {

    private String stripePaymentIntentId;
    private String orderId;
}
