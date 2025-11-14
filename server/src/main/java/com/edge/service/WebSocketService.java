package com.edge.service;

import com.edge.entity.Address;
import com.edge.entity.Customer;
import com.edge.entity.Order;
import com.edge.entity.Product;
import com.edge.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketService.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Send entity update to all connected clients
     */
    public void broadcastEntityUpdate(String entityType, Object entity) {
        try {
            String topic = "/topic/" + entityType.toLowerCase() + "s/update";
            logger.info("Broadcasting {} update: {}", entityType, getEntityId(entity));
            messagingTemplate.convertAndSend(topic, entity);
        } catch (Exception e) {
            logger.error("Error broadcasting {} update", entityType, e);
        }
    }
    
    /**
     * Send entity deletion notification to all connected clients
     */
    public void broadcastEntityDelete(String entityType, String entityId) {
        try {
            String topic = "/topic/" + entityType.toLowerCase() + "s/delete";
            logger.info("Broadcasting {} deletion: {}", entityType, entityId);
            messagingTemplate.convertAndSend(topic, entityId);
        } catch (Exception e) {
            logger.error("Error broadcasting {} deletion", entityType, e);
        }
    }
    
    // Convenience methods for each entity type
    public void broadcastOrderUpdate(Order order) {
        broadcastEntityUpdate("order", order);
    }
    
    public void broadcastOrderDelete(String orderId) {
        broadcastEntityDelete("order", orderId);
    }
    
    public void broadcastCustomerUpdate(Customer customer) {
        broadcastEntityUpdate("customer", customer);
    }
    
    public void broadcastCustomerDelete(String customerId) {
        broadcastEntityDelete("customer", customerId);
    }
    
    public void broadcastProductUpdate(Product product) {
        broadcastEntityUpdate("product", product);
    }
    
    public void broadcastProductDelete(String productId) {
        broadcastEntityDelete("product", productId);
    }
    
    public void broadcastAddressUpdate(Address address) {
        broadcastEntityUpdate("address", address);
    }
    
    public void broadcastAddressDelete(String addressId) {
        broadcastEntityDelete("address", addressId);
    }
    
    public void broadcastUserUpdate(User user) {
        broadcastEntityUpdate("user", user);
    }
    
    public void broadcastUserDelete(String userId) {
        broadcastEntityDelete("user", userId);
    }
    
    private String getEntityId(Object entity) {
        if (entity instanceof Order) {
            return ((Order) entity).getId();
        } else if (entity instanceof Customer) {
            return ((Customer) entity).getId();
        } else if (entity instanceof Product) {
            return ((Product) entity).getId();
        } else if (entity instanceof Address) {
            return ((Address) entity).getId();
        } else if (entity instanceof User) {
            return ((User) entity).getId();
        }
        return "unknown";
    }
}

