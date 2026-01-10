package in.xing.billingsoftware.service;

import in.xing.billingsoftware.io.OrderRequest;
import in.xing.billingsoftware.io.OrderResponse;
import in.xing.billingsoftware.io.PaymentVerificationRequest;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request);

    void deleteOrder(String orderId);

    List<OrderResponse> getLastedOrders();

    OrderResponse verifyPayment(PaymentVerificationRequest request);
}
