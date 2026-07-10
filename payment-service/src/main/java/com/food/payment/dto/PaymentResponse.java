package com.food.payment.dto;

import java.math.BigDecimal;

public class PaymentResponse {
    private String transactionId;
    private Long orderId;
    private BigDecimal amount;
    private String status;

    public PaymentResponse() {
    }

    public PaymentResponse(String transactionId, Long orderId, BigDecimal amount, String status) {
        this.transactionId = transactionId;
        this.orderId = orderId;
        this.amount = amount;
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
