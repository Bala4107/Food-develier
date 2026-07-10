package com.food.kitchen.dto;

public class KitchenRequest {
    private Long orderId;
    private String items;

    public KitchenRequest() {
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getItems() {
        return items;
    }

    public void setItems(String items) {
        this.items = items;
    }
}
