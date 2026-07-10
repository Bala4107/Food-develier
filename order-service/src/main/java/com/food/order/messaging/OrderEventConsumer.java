package com.food.order.messaging;

import com.food.order.dto.OrderCreatedEvent;
import com.food.order.entity.Order;
import com.food.order.repository.OrderRepository;
import org.camunda.bpm.engine.RuntimeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Component
public class OrderEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventConsumer.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RuntimeService runtimeService;

    @JmsListener(destination = "${app.queue.order-created}")
    public void consumeOrderCreatedEvent(OrderCreatedEvent event) {
        log.info("[OrderService] Consuming OrderCreatedEvent for Order #{}", event.getOrderId());

        Order order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order != null) {
            order.setStatus("PAYMENT_PROCESSING");
            orderRepository.save(order);
            log.info("[OrderService] Order #{} status updated to PAYMENT_PROCESSING", order.getId());

            // Start Camunda workflow
            Map<String, Object> variables = new HashMap<>();
            variables.put("orderId", order.getId());
            variables.put("customerName", order.getCustomerName());
            variables.put("totalAmount", order.getTotalAmount().doubleValue());
            variables.put("items", order.getItems());
            variables.put("deliveryAddress", order.getDeliveryAddress());

            runtimeService.startProcessInstanceByKey("foodOrderProcess", String.valueOf(order.getId()), variables);
            log.info("[OrderService] Started Camunda workflow for Order #{}", order.getId());
        } else {
            log.error("[OrderService] Order #{} not found during message consumption", event.getOrderId());
        }
    }
}
