package com.food.order.service;

import com.food.order.dto.OrderCreatedEvent;
import com.food.order.dto.OrderRequest;
import com.food.order.dto.OrderResponse;
import com.food.order.entity.Order;
import com.food.order.exception.ResourceNotFoundException;
import com.food.order.messaging.OrderEventProducer;
import com.food.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderEventProducer eventProducer;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Order order = new Order(
                request.getCustomerName(),
                request.getItems(),
                request.getTotalAmount(),
                "WAITING_FOR_APPROVAL",
                request.getDeliveryAddress()
        );

        order = orderRepository.save(order);
        
        // Exact console output format required
        System.out.println("[OrderService] Order #" + order.getId() + " - WAITING_FOR_APPROVAL");

        // Camunda/ActiveMQ automatic workflow disabled for manual admin lifecycle control
        /*
        OrderCreatedEvent event = new OrderCreatedEvent(
                order.getId(),
                order.getCustomerName(),
                order.getTotalAmount(),
                order.getItems(),
                order.getDeliveryAddress()
        );
        eventProducer.sendOrderCreatedEvent(event);
        */

        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToResponse(order);
    }

    @Transactional
    public void updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        order.setStatus(status);
        
        if ("OUT_FOR_DELIVERY".equals(status)) {
            if (order.getDriverName() == null) {
                String[] drivers = {"Rahul Roy", "Vikram Rathore", "Karan Malhotra", "Aditya Roy", "Kabir Sen"};
                String[] phones = {"+91 9876543210", "+91 9123456789", "+91 9345678901", "+91 9567890123", "+91 9789012345"};
                String[] vehicles = {"KA-51-AB-1234", "MH-02-CD-5678", "DL-3C-EF-9012", "HR-26-GH-3456", "TN-01-IJ-7890"};
                int rand = (int)(Math.random() * 5);
                order.setDriverName(drivers[rand]);
                order.setDriverPhone(phones[rand]);
                order.setDriverVehicle(vehicles[rand]);
                order.setEstimatedDeliveryTime((20 + (int)(Math.random() * 20)) + " mins");
            }
        }
        
        orderRepository.save(order);
        log.info("[OrderService] DB Order #{} status transitioned to {}", id, status);
    }

    private OrderResponse mapToResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getCustomerName(),
                order.getItems(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getDeliveryAddress(),
                order.getCreatedAt(),
                order.getDriverName(),
                order.getDriverPhone(),
                order.getDriverVehicle(),
                order.getEstimatedDeliveryTime()
        );
    }
}
