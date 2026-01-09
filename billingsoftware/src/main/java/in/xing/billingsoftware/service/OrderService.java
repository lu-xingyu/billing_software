package in.xing.billingsoftware.service;

import in.xing.billingsoftware.io.OrderRequest;
import in.xing.billingsoftware.io.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse createdOrder(OrderRequest request);

    void deleteOrder(String orderId);

    List<OrderResponse> getLastedOrders();
}
