package com.food.delivery.dto;

public class DeliveryResponse {
    private Long deliveryId;
    private Long orderId;
    private String driverName;
    private String status;

    public DeliveryResponse() {
    }

    public DeliveryResponse(Long deliveryId, Long orderId, String driverName, String status) {
        this.deliveryId = deliveryId;
        this.orderId = orderId;
        this.driverName = driverName;
        this.status = status;
    }

    public Long getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(Long deliveryId) {
        this.deliveryId = deliveryId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
