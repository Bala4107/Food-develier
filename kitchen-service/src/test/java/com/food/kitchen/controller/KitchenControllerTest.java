package com.food.kitchen.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.food.kitchen.dto.KitchenRequest;
import com.food.kitchen.entity.KitchenOrder;
import com.food.kitchen.repository.KitchenOrderRepository;
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

@WebMvcTest(KitchenController.class)
public class KitchenControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private KitchenOrderRepository kitchenOrderRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testPrepareFood() throws Exception {
        KitchenRequest request = new KitchenRequest();
        request.setOrderId(1L);
        request.setItems("Ghee Podi Masala Dosa x 1");

        Mockito.when(kitchenOrderRepository.save(Mockito.any(KitchenOrder.class))).thenAnswer(invocation -> {
            KitchenOrder order = invocation.getArgument(0);
            order.setId(1L);
            return order;
        });

        mockMvc.perform(post("/api/kitchen/prepare")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(1L))
                .andExpect(jsonPath("$.status").value("READY"));
    }
}
