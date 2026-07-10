package com.food.order.delegate;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component("handlePaymentFailureDelegate")
public class HandlePaymentFailureDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(HandlePaymentFailureDelegate.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        log.info("[OrderService] Workflow handling payment failure for Order #{}", orderId);

        // Update status to CANCELLED
        updateOrderStatus(orderId, "CANCELLED");

        // Exact logs required
        System.out.println("[OrderService] Order #" + orderId + " - CANCELLED");
        System.out.println("[OrderService] Order #" + orderId + " - WORKFLOW COMPLETED");
    }

    private void updateOrderStatus(Long orderId, String status) {
        String url = "http://localhost:8081/api/orders/" + orderId + "/status?status=" + status;
        try {
            restTemplate.put(url, null);
        } catch (Exception e) {
            log.error("Failed to update status for Order #{} to {}: {}", orderId, status, e.getMessage());
        }
    }
}
