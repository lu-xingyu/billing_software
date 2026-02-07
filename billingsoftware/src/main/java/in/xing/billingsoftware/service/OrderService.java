package in.xing.billingsoftware.service;

import in.xing.billingsoftware.io.OrderRequest;
import in.xing.billingsoftware.io.OrderResponse;
import in.xing.billingsoftware.io.PaymentVerificationRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request);

    void deleteOrder(String orderId);

    OrderResponse getOrder(String orderId);

    List<OrderResponse> getLastedOrders();

    OrderResponse verifyPayment(PaymentVerificationRequest request);

    Double sumSalesByDate(LocalDate date);

    Long countByOrderDate(LocalDate date);

    List<OrderResponse> findRecentOrders();
}
