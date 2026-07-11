package com.food.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.food.order.dto.OrderRequest;
import com.food.order.dto.OrderResponse;
import com.food.order.service.OrderService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = OrderController.class,
    excludeFilters = {
        @org.springframework.context.annotation.ComponentScan.Filter(
            type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE,
            classes = {com.food.order.config.SecurityConfig.class, com.food.order.config.JwtRequestFilter.class}
        )
    },
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
    }
)
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreateOrder() throws Exception {
        OrderRequest request = new OrderRequest();
        request.setCustomerName("John Doe");
        request.setItems("Chettinad Chicken Biryani x 1");
        request.setTotalAmount(new BigDecimal("220.00"));
        request.setDeliveryAddress("456 Park Avenue");

        OrderResponse response = new OrderResponse(
                1L,
                "John Doe",
                "Chettinad Chicken Biryani x 1",
                new BigDecimal("220.00"),
                "PLACED",
                "456 Park Avenue",
                LocalDateTime.now()
        );

        Mockito.when(orderService.createOrder(Mockito.any(OrderRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.customerName").value("John Doe"))
                .andExpect(jsonPath("$.status").value("PLACED"));
    }

    @Test
    public void testGetAllOrders() throws Exception {
        OrderResponse response = new OrderResponse(
                1L,
                "John Doe",
                "Chettinad Chicken Biryani x 1",
                new BigDecimal("220.00"),
                "PLACED",
                "456 Park Avenue",
                LocalDateTime.now()
        );

        Mockito.when(orderService.getAllOrders()).thenReturn(Collections.singletonList(response));

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].customerName").value("John Doe"));
    }

    @Test
    public void testGetOrderById() throws Exception {
        OrderResponse response = new OrderResponse(
                1L,
                "John Doe",
                "Chettinad Chicken Biryani x 1",
                new BigDecimal("220.00"),
                "PLACED",
                "456 Park Avenue",
                LocalDateTime.now()
        );

        Mockito.when(orderService.getOrderById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.customerName").value("John Doe"));
    }

    @Test
    public void testUpdateOrderStatus() throws Exception {
        Mockito.doNothing().when(orderService).updateOrderStatus(1L, "DELIVERED");

        mockMvc.perform(put("/api/orders/1/status?status=DELIVERED"))
                .andExpect(status().isOk());
    }
}
