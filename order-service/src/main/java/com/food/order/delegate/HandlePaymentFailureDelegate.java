package com.food.order.delegate;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import org.springframework.beans.factory.annotation.Autowired;
import com.food.order.service.OrderService;

@Component("handlePaymentFailureDelegate")
public class HandlePaymentFailureDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(HandlePaymentFailureDelegate.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private OrderService orderService;

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
        try {
            orderService.updateOrderStatus(orderId, status);
        } catch (Exception e) {
            log.error("Failed to update status for Order #{} to {}: {}", orderId, status, e.getMessage());
        }
    }
}
