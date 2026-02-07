package in.xing.billingsoftware.io;


import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentDetails {

    private String stripePaymentIntentId;
    private PaymentStatus status;


    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED
    }
}
