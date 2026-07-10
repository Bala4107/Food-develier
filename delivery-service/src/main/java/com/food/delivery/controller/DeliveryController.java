package com.food.delivery.controller;

import com.food.delivery.dto.DeliveryRequest;
import com.food.delivery.dto.DeliveryResponse;
import com.food.delivery.entity.Delivery;
import com.food.delivery.repository.DeliveryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "*")
public class DeliveryController {

    private static final Logger log = LoggerFactory.getLogger(DeliveryController.class);
    private final RestTemplate restTemplate = new RestTemplate();

    private final String[] DRIVERS = {"James Cooper", "Robert Falcon", "Emily Thorne", "David Miller", "Lisa Vance"};

    @Autowired
    private DeliveryRepository deliveryRepository;

    @PostMapping("/assign")
    public ResponseEntity<DeliveryResponse> assignDelivery(@RequestBody DeliveryRequest request) {
        log.info("[DeliveryService] Assigning driver for Order #{}", request.getOrderId());

        // Assign a random driver
        int driverIndex = (int) (Math.random() * DRIVERS.length);
        String assignedDriver = DRIVERS[driverIndex];

        // Transition Order status to OUT_FOR_DELIVERY
        updateOrderStatus(request.getOrderId(), "OUT_FOR_DELIVERY");
        System.out.println("[DeliveryService] Order #" + request.getOrderId() + " - OUT FOR DELIVERY");

        // Simulate driver transit duration
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Transition Order status to DELIVERED
        updateOrderStatus(request.getOrderId(), "DELIVERED");

        // Save delivery ticket to DB
        Delivery delivery = new Delivery(
                request.getOrderId(),
                assignedDriver,
                "DELIVERED",
                request.getDeliveryAddress()
        );
        delivery = deliveryRepository.save(delivery);

        // Exact logs required
        System.out.println("[DeliveryService] Order #" + request.getOrderId() + " - DELIVERED");

        DeliveryResponse response = new DeliveryResponse(
                delivery.getId(),
                request.getOrderId(),
                assignedDriver,
                "DELIVERED"
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
