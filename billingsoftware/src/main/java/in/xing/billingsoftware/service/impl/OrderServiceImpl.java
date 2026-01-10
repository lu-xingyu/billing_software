package in.xing.billingsoftware.service.impl;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import in.xing.billingsoftware.entity.OrderEntity;
import in.xing.billingsoftware.entity.OrderItemEntity;
import in.xing.billingsoftware.io.*;
import in.xing.billingsoftware.respository.OrderEntityRepository;
import in.xing.billingsoftware.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderEntityRepository orderEntityRepository;
    @Value("${stripe_secret_key}")
    private String stripe_secret_key;
    
    @Override
    public OrderResponse createOrder(OrderRequest request) {
        OrderEntity newOrder =  convertToOrderEntity(request);

        PaymentDetails paymentDetails = new PaymentDetails();
        paymentDetails.setStatus(newOrder.getPaymentMethod() == PaymentMethod.CASH ?
                PaymentDetails.PaymentStatus.COMPLETED : PaymentDetails.PaymentStatus.PENDING);
        newOrder.setPaymentDetails(paymentDetails);
        
        List<OrderItemEntity> orderItems =  request.getCartItems().stream()
                .map(this::convertToOrderItemEntity)
                .collect(Collectors.toList());
        
        newOrder.setItems(orderItems);
        newOrder = orderEntityRepository.save(newOrder);
        return convertToResponse(newOrder);
    }

    private OrderResponse convertToResponse(OrderEntity newOrder) {
        return OrderResponse.builder()
                .orderId(newOrder.getOrderId())
                .customerName(newOrder.getCustomerName())
                .phoneNumber(newOrder.getPhoneNumber())
                .subtotal(newOrder.getSubtotal())
                .tax(newOrder.getTax())
                .grandTotal(newOrder.getGrandTotal())
                .paymentMethod(newOrder.getPaymentMethod())
                .items(newOrder.getItems().stream()
                        .map(this::convertToItemResponse)
                        .collect(Collectors.toList()))
                .paymentDetails(newOrder.getPaymentDetails())
                .createdAt(newOrder.getCreatedAt())
                .build();
    }

    private OrderResponse.OrderItemResponse convertToItemResponse(OrderItemEntity orderItemEntity) {
        return OrderResponse.OrderItemResponse.builder()
                .itemId(orderItemEntity.getItemId())
                .name(orderItemEntity.getName())
                .price(orderItemEntity.getPrice())
                .quantity(orderItemEntity.getQuantity())
                .build();
    }

    private OrderItemEntity convertToOrderItemEntity(OrderRequest.OrderItemRequest orderItemRequest) {
        return OrderItemEntity.builder()
                .itemId(orderItemRequest.getItemId())
                .name(orderItemRequest.getName())
                .price(orderItemRequest.getPrice())
                .quantity(orderItemRequest.getQuantity())
                .build();
    }

    private OrderEntity convertToOrderEntity(OrderRequest request) {
        return OrderEntity.builder()
                .customerName(request.getCustomerName())
                .phoneNumber(request.getPhoneNumber())
                .subtotal(request.getSubtotal())
                .tax(request.getTax())
                .grandTotal(request.getGrandTotal())
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()))
                .build();
    };

    @Override
    public void deleteOrder(String orderId) {
        OrderEntity existingOrder = orderEntityRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        orderEntityRepository.delete(existingOrder);
    }

    @Override
    public List<OrderResponse> getLastedOrders() {
        return orderEntityRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse verifyPayment(PaymentVerificationRequest request) {
        OrderEntity existingOrder = orderEntityRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        try {
            Stripe.apiKey = stripe_secret_key;
            PaymentIntent paymentIntent = PaymentIntent.retrieve(request.getStripePaymentIntentId());
            if (!paymentIntent.getStatus().equals("succeed")) {
                throw new RuntimeException("Payment verification failed");
            }
            PaymentDetails paymentDetails = existingOrder.getPaymentDetails();
            paymentDetails.setStripePaymentIntentId(request.getStripePaymentIntentId());
            paymentDetails.setStatus(PaymentDetails.PaymentStatus.COMPLETED);

            existingOrder = orderEntityRepository.save(existingOrder);
            return convertToResponse(existingOrder);
        } catch (StripeException e) {
            throw new RuntimeException("Retrieve PaymentIntent failed");
        }


    }
}
