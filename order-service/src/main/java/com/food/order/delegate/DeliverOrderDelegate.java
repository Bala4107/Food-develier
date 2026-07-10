package com.food.order.delegate;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component("deliverOrderDelegate")
public class DeliverOrderDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(DeliverOrderDelegate.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        String deliveryAddress = (String) execution.getVariable("deliveryAddress");

        log.info("[OrderService] Workflow calling DeliveryService for Order #{}", orderId);

        Map<String, Object> request = new HashMap<>();
        request.put("orderId", orderId);
        request.put("deliveryAddress", deliveryAddress);

        String deliveryServiceUrl = "http://localhost:8084/api/delivery/assign";
        try {
            restTemplate.postForLocation(deliveryServiceUrl, request);
            log.info("[OrderService] DeliveryService process completed for Order #{}", orderId);
        } catch (Exception e) {
            log.error("[OrderService] Error calling DeliveryService for Order #{}: {}", orderId, e.getMessage());
            throw e;
        }
    }
}
