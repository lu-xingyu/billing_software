package in.xing.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StripePaymentIntentResponse {

    private String id;
    private String entity;
    private Long amount;
    private String currency;
    private String status;
    private Date created_at;
    private String receipt;
    private String client_secret;
    private String orderId;
}
