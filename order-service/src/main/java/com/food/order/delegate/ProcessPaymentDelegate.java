package com.food.order.delegate;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import org.springframework.beans.factory.annotation.Autowired;
import com.food.order.service.OrderService;
import java.util.HashMap;
import java.util.Map;

@Component("processPaymentDelegate")
public class ProcessPaymentDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(ProcessPaymentDelegate.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private OrderService orderService;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        Double amount = (Double) execution.getVariable("totalAmount");

        log.info("[OrderService] Workflow calling PaymentService for Order #{}", orderId);

        // Update main order status to PAYMENT_PROCESSING
        updateOrderStatus(orderId, "PAYMENT_PROCESSING");

        Map<String, Object> request = new HashMap<>();
        request.put("orderId", orderId);
        request.put("amount", amount);

        String paymentServiceUrl = "http://localhost:8082/api/payments/process";
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(paymentServiceUrl, request, Map.class);
            
            String status = (String) response.get("status");
            log.info("[OrderService] PaymentService response for Order #{}: {}", orderId, status);

            execution.setVariable("paymentStatus", status);

            if ("SUCCESS".equalsIgnoreCase(status)) {
                // Exact console log format
                System.out.println("[PaymentService] Order #" + orderId + " - PAYMENT SUCCESS");
                updateOrderStatus(orderId, "PAYMENT_SUCCESS");
            } else {
                System.out.println("[PaymentService] Order #" + orderId + " - PAYMENT FAILED");
                updateOrderStatus(orderId, "PAYMENT_FAILED");
            }
        } catch (Exception e) {
            log.error("[OrderService] Error calling PaymentService for Order #{}: {}", orderId, e.getMessage());
            execution.setVariable("paymentStatus", "FAILED");
            System.out.println("[PaymentService] Order #" + orderId + " - PAYMENT FAILED");
            updateOrderStatus(orderId, "PAYMENT_FAILED");
        }
    }

    private void updateOrderStatus(Long orderId, String status) {
        try {
            orderService.updateOrderStatus(orderId, status);
        } catch (Exception e) {
            log.error("Failed to update status for Order #{} to {}: {}", orderId, status, e.getMessage());
        }
    }
}
