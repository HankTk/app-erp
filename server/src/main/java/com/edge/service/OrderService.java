package com.edge.service;

import com.edge.entity.Order;
import com.edge.entity.OrderItem;
import com.edge.entity.Product;
import com.edge.repository.OrderRepository;
import com.edge.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired(required = false)
    private WebSocketService webSocketService;
    
    public List<Order> getAllOrders() {
        return orderRepository.getAllOrders();
    }
    
    public Optional<Order> getOrderById(String id) {
        return orderRepository.getOrderById(id);
    }
    
    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.getOrderByOrderNumber(orderNumber);
    }
    
    public List<Order> getOrdersByCustomerId(String customerId) {
        return orderRepository.getOrdersByCustomerId(customerId);
    }
    
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.getOrdersByStatus(status);
    }
    
    public Order createOrder(Order order) {
        // Enrich order items with product information
        enrichOrderItems(order);
        Order created = orderRepository.createOrder(order);
        if (webSocketService != null) {
            webSocketService.broadcastOrderUpdate(created);
        }
        return created;
    }
    
    public Order updateOrder(String id, Order orderDetails) {
        System.out.println("OrderService.updateOrder - ID: " + id + ", Status: " + orderDetails.getStatus());
        // Enrich order items with product information
        enrichOrderItems(orderDetails);
        Order updated = orderRepository.updateOrder(id, orderDetails);
        System.out.println("OrderService.updateOrder - Updated status: " + updated.getStatus());
        
        // Broadcast update via WebSocket
        if (webSocketService != null) {
            webSocketService.broadcastOrderUpdate(updated);
        }
        
        return updated;
    }
    
    public Order addOrderItem(String orderId, String productId, Integer quantity) {
        Order order = orderRepository.getOrderById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        Product product = productRepository.getProductById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        // Check if item already exists
        Optional<OrderItem> existingItem = order.getItems().stream()
            .filter(item -> productId.equals(item.getProductId()))
            .findFirst();
        
        if (existingItem.isPresent()) {
            // Update quantity
            OrderItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            item.calculateLineTotal();
        } else {
            // Create new item
            OrderItem newItem = new OrderItem();
            newItem.setId(java.util.UUID.randomUUID().toString());
            newItem.setProductId(product.getId());
            newItem.setProductCode(product.getProductCode());
            newItem.setProductName(product.getProductName());
            newItem.setQuantity(quantity);
            newItem.setUnitPrice(product.getUnitPrice());
            newItem.calculateLineTotal();
            order.getItems().add(newItem);
        }
        
        order.calculateTotals();
        return orderRepository.updateOrder(orderId, order);
    }
    
    public Order updateOrderItemQuantity(String orderId, String itemId, Integer quantity) {
        Order order = orderRepository.getOrderById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        OrderItem item = order.getItems().stream()
            .filter(i -> itemId.equals(i.getId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Order item not found with id: " + itemId));
        
        item.setQuantity(quantity);
        item.calculateLineTotal();
        order.calculateTotals();
        
        return orderRepository.updateOrder(orderId, order);
    }
    
    public Order removeOrderItem(String orderId, String itemId) {
        Order order = orderRepository.getOrderById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        boolean removed = order.getItems().removeIf(item -> itemId.equals(item.getId()));
        if (!removed) {
            throw new RuntimeException("Order item not found with id: " + itemId);
        }
        
        order.calculateTotals();
        return orderRepository.updateOrder(orderId, order);
    }
    
    public void deleteOrder(String id) {
        orderRepository.deleteOrder(id);
        
        // Broadcast deletion via WebSocket
        if (webSocketService != null) {
            webSocketService.broadcastOrderDelete(id);
        }
    }
    
    private void enrichOrderItems(Order order) {
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getProductId() != null) {
                    productRepository.getProductById(item.getProductId()).ifPresent(product -> {
                        item.setProductCode(product.getProductCode());
                        item.setProductName(product.getProductName());
                        if (item.getUnitPrice() == null) {
                            item.setUnitPrice(product.getUnitPrice());
                        }
                        item.calculateLineTotal();
                    });
                }
            }
        }
    }
}

