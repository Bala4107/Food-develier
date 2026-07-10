package com.food.order.delegate;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("completeWorkflowDelegate")
public class CompleteWorkflowDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(CompleteWorkflowDelegate.class);

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        log.info("[OrderService] Workflow completing successfully for Order #{}", orderId);

        // Exact logs required
        System.out.println("[OrderService] Order #" + orderId + " - WORKFLOW COMPLETED");
    }
}
