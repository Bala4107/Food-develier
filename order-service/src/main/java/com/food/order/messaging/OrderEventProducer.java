package com.food.order.messaging;

import com.food.order.dto.OrderCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventProducer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventProducer.class);

    @Autowired
    private JmsTemplate jmsTemplate;

    @Value("${app.queue.order-created}")
    private String orderCreatedQueue;

    public void sendOrderCreatedEvent(OrderCreatedEvent event) {
        log.info("[OrderService] Publishing Order #{} to queue '{}'", event.getOrderId(), orderCreatedQueue);
        jmsTemplate.convertAndSend(orderCreatedQueue, event);
    }
}
