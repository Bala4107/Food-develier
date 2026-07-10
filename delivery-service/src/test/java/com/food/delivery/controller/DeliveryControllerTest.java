package com.food.delivery.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.food.delivery.dto.DeliveryRequest;
import com.food.delivery.entity.Delivery;
import com.food.delivery.repository.DeliveryRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DeliveryController.class)
public class DeliveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DeliveryRepository deliveryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testAssignDelivery() throws Exception {
        DeliveryRequest request = new DeliveryRequest();
        request.setOrderId(1L);
        request.setDeliveryAddress("123 South Mada Street, Mylapore");

        Mockito.when(deliveryRepository.save(Mockito.any(Delivery.class))).thenAnswer(invocation -> {
            Delivery delivery = invocation.getArgument(0);
            delivery.setId(1L);
            return delivery;
        });

        mockMvc.perform(post("/api/delivery/assign")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(1L))
                .andExpect(jsonPath("$.status").value("DELIVERED"))
                .andExpect(jsonPath("$.driverName").exists());
    }
}
