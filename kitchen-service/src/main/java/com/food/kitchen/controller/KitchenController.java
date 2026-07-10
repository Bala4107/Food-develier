package com.food.kitchen.controller;

import com.food.kitchen.dto.KitchenRequest;
import com.food.kitchen.dto.KitchenResponse;
import com.food.kitchen.entity.KitchenOrder;
import com.food.kitchen.repository.KitchenOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/kitchen")
@CrossOrigin(origins = "*")
public class KitchenController {

    private static final Logger log = LoggerFactory.getLogger(KitchenController.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private KitchenOrderRepository kitchenOrderRepository;

    @PostMapping("/prepare")
    public ResponseEntity<KitchenResponse> prepareFood(@RequestBody KitchenRequest request) {
        log.info("[KitchenService] Received preparation request for Order #{}", request.getOrderId());

        // Update master order status to KITCHEN_PREPARING
        updateOrderStatus(request.getOrderId(), "KITCHEN_PREPARING");

        // Simulate cooking duration
        try {
            Thread.sleep(2500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Save kitchen status as READY
        KitchenOrder kitchenOrder = new KitchenOrder(
                request.getOrderId(),
                request.getItems(),
                "READY"
        );
        kitchenOrder = kitchenOrderRepository.save(kitchenOrder);

        // Exact logs required
        System.out.println("[KitchenService] Order #" + request.getOrderId() + " - FOOD READY");

        KitchenResponse response = new KitchenResponse(
                kitchenOrder.getId(),
                request.getOrderId(),
                "READY"
        );

        return ResponseEntity.ok(response);
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
