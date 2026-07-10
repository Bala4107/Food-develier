package com.food.payment.controller;

import com.food.payment.dto.PaymentRequest;
import com.food.payment.dto.PaymentResponse;
import com.food.payment.entity.Payment;
import com.food.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest request) {
        log.info("[PaymentService] Processing payment for Order #{} of amount {}", request.getOrderId(), request.getAmount());

        // Simulate network delay
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Random success or fail: 80% success, 20% failure
        String status = Math.random() > 0.2 ? "SUCCESS" : "FAILED";
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = new Payment(
                request.getOrderId(),
                request.getAmount(),
                status,
                transactionId
        );
        paymentRepository.save(payment);

        // Exact logs required: handled inside the payment service execution
        // Note: The delegate also logs this, but printing it here ensures it comes from [PaymentService]
        if ("SUCCESS".equals(status)) {
            System.out.println("[PaymentService] Order #" + request.getOrderId() + " - PAYMENT SUCCESS");
        } else {
            System.out.println("[PaymentService] Order #" + request.getOrderId() + " - PAYMENT FAILED");
        }

        PaymentResponse response = new PaymentResponse(
                transactionId,
                request.getOrderId(),
                request.getAmount(),
                status
        );

        return ResponseEntity.ok(response);
    }
}
