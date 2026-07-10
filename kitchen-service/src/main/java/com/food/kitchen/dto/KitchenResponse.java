package com.food.kitchen.dto;

public class KitchenResponse {
    private Long kitchenOrderId;
    private Long orderId;
    private String status;

    public KitchenResponse() {
    }

    public KitchenResponse(Long kitchenOrderId, Long orderId, String status) {
        this.kitchenOrderId = kitchenOrderId;
        this.orderId = orderId;
        this.status = status;
    }

    public Long getKitchenOrderId() {
        return kitchenOrderId;
    }

    public void setKitchenOrderId(Long kitchenOrderId) {
        this.kitchenOrderId = kitchenOrderId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
