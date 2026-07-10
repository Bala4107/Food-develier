package com.food.order.delegate;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component("prepareFoodDelegate")
public class PrepareFoodDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(PrepareFoodDelegate.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        String items = (String) execution.getVariable("items");

        log.info("[OrderService] Workflow calling KitchenService for Order #{}", orderId);

        Map<String, Object> request = new HashMap<>();
        request.put("orderId", orderId);
        request.put("items", items);

        String kitchenServiceUrl = "http://localhost:8083/api/kitchen/prepare";
        try {
            restTemplate.postForLocation(kitchenServiceUrl, request);
            log.info("[OrderService] KitchenService preparation completed for Order #{}", orderId);
        } catch (Exception e) {
            log.error("[OrderService] Error calling KitchenService for Order #{}: {}", orderId, e.getMessage());
            throw e; // Rethrow to fail workflow task if server is down
        }
    }
}
