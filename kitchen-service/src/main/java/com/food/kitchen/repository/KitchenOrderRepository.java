package com.food.kitchen.repository;

import com.food.kitchen.entity.KitchenOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KitchenOrderRepository extends JpaRepository<KitchenOrder, Long> {
}
