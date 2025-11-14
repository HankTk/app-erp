package com.edge.repository;

import com.edge.entity.Order;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class OrderRepository extends AbstractJsonRepository<Order> {
    private static final Logger logger = LoggerFactory.getLogger(OrderRepository.class);
    private static final String DATA_FILE_NAME = "orders.json";
    private static final String DATA_DIR_NAME = "data";
    private static final String COUNTER_FILE_NAME = "order_counter.json";
    private static final long INITIAL_ORDER_NUMBER = 100000L;
    private java.nio.file.Path counterFilePath;

    public OrderRepository() {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "orders");
        try {
            java.nio.file.Path dataDir = java.nio.file.Paths.get(DATA_DIR_NAME);
            if (!java.nio.file.Files.exists(dataDir)) {
                java.nio.file.Files.createDirectories(dataDir);
            }
            counterFilePath = dataDir.resolve(COUNTER_FILE_NAME);
        } catch (IOException e) {
            logger.error("Error initializing counter file path", e);
            throw new RuntimeException("Failed to initialize order counter", e);
        }
    }

    @Override
    protected ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    @Override
    protected void loadItemsFromFile() throws IOException {
        String content = new String(java.nio.file.Files.readAllBytes(dataFilePath));
        if (content.trim().isEmpty()) {
            logger.info("Data file is empty, starting with empty order list");
            items = new java.util.ArrayList<>();
            return;
        }
        try {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<Order>>() {});
            logger.info("Successfully loaded {} orders from data file", items.size());
        } catch (Exception e) {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(Order entity) {
        return entity.getId();
    }

    @Override
    protected void setId(Order entity, String id) {
        entity.setId(id);
    }

    public Optional<Order> getOrderById(String id) {
        return findById(id);
    }

    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        if (orderNumber == null || orderNumber.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(order -> orderNumber.equals(order.getOrderNumber())).findFirst();
    }

    public List<Order> getAllOrders() {
        return findAll();
    }

    public List<Order> getOrdersByCustomerId(String customerId) {
        if (customerId == null || customerId.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
            .filter(order -> customerId.equals(order.getCustomerId()))
            .collect(Collectors.toList());
    }

    public List<Order> getOrdersByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
            .filter(order -> status.equals(order.getStatus()))
            .collect(Collectors.toList());
    }

    public Order createOrder(Order order) {
        if (order == null) throw new IllegalArgumentException("Order cannot be null");
        
        // Generate order number if not provided
        if (order.getOrderNumber() == null || order.getOrderNumber().trim().isEmpty()) {
            String newOrderNumber = generateNextOrderNumber();
            order.setOrderNumber(newOrderNumber);
            logger.info("Generated order number: {}", newOrderNumber);
        } else if (getOrderByOrderNumber(order.getOrderNumber()).isPresent()) {
            throw new OrderAlreadyExistsException("Order with number " + order.getOrderNumber() + " already exists");
        }
        
        // Calculate totals before saving
        order.calculateTotals();
        return save(order);
    }
    
    private synchronized String generateNextOrderNumber() {
        try {
            // First, try to find a gap (reuse deleted order numbers)
            long nextOrderNumber = findNextAvailableOrderNumber();
            
            // Update counter file to reflect the new value
            writeCounter(nextOrderNumber);
            logger.info("Generated order number: {}", nextOrderNumber);
            return String.valueOf(nextOrderNumber);
        } catch (IOException e) {
            logger.error("Error generating order number", e);
            throw new RuntimeException("Failed to generate order number", e);
        }
    }
    
    private long findNextAvailableOrderNumber() {
        // Get all existing order numbers as a sorted set
        java.util.Set<Long> existingNumbers = items.stream()
            .filter(order -> order.getOrderNumber() != null && !order.getOrderNumber().trim().isEmpty())
            .mapToLong(order -> {
                try {
                    return Long.parseLong(order.getOrderNumber());
                } catch (NumberFormatException e) {
                    return 0L;
                }
            })
            .filter(num -> num >= INITIAL_ORDER_NUMBER)
            .boxed()
            .collect(java.util.stream.Collectors.toSet());
        
        // If no existing orders, start from initial value
        if (existingNumbers.isEmpty()) {
            return INITIAL_ORDER_NUMBER;
        }
        
        // Find the first gap starting from INITIAL_ORDER_NUMBER
        for (long num = INITIAL_ORDER_NUMBER; num <= findMaxOrderNumber() + 1; num++) {
            if (!existingNumbers.contains(num)) {
                return num;
            }
        }
        
        // If no gap found, use max + 1
        return findMaxOrderNumber() + 1;
    }
    
    private long findMaxOrderNumber() {
        return items.stream()
            .filter(order -> order.getOrderNumber() != null && !order.getOrderNumber().trim().isEmpty())
            .mapToLong(order -> {
                try {
                    return Long.parseLong(order.getOrderNumber());
                } catch (NumberFormatException e) {
                    return 0L;
                }
            })
            .max()
            .orElse(INITIAL_ORDER_NUMBER - 1);
    }
    
    private void writeCounter(long value) throws IOException {
        java.nio.file.Files.write(counterFilePath, String.valueOf(value).getBytes());
    }

    public Order updateOrder(String id, Order orderDetails) {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("Order ID cannot be null or empty");
        if (orderDetails == null)
            throw new IllegalArgumentException("Order details cannot be null");

        Order existingOrder = findById(id).orElseThrow(() -> 
            new OrderNotFoundException("Order not found with id: " + id));
        
        logger.info("updateOrder called - ID: {}, incoming status: {}, existing status: {}", 
            id, orderDetails.getStatus(), existingOrder.getStatus());
        logger.info("Full orderDetails object: {}", orderDetails);

        if (orderDetails.getOrderNumber() != null && !orderDetails.getOrderNumber().trim().isEmpty()) {
            Optional<Order> numberCheck = getOrderByOrderNumber(orderDetails.getOrderNumber());
            if (numberCheck.isPresent() && !id.equals(numberCheck.get().getId())) {
                throw new OrderAlreadyExistsException("Order with number " + orderDetails.getOrderNumber() + " already exists");
            }
        }

        // Update fields
        if (orderDetails.getOrderNumber() != null) {
            existingOrder.setOrderNumber(orderDetails.getOrderNumber());
        }
        if (orderDetails.getCustomerId() != null) {
            existingOrder.setCustomerId(orderDetails.getCustomerId());
        }
        if (orderDetails.getShippingAddressId() != null) {
            existingOrder.setShippingAddressId(orderDetails.getShippingAddressId());
        }
        if (orderDetails.getBillingAddressId() != null) {
            existingOrder.setBillingAddressId(orderDetails.getBillingAddressId());
        }
        if (orderDetails.getOrderDate() != null) {
            existingOrder.setOrderDate(orderDetails.getOrderDate());
        }
        if (orderDetails.getShipDate() != null) {
            existingOrder.setShipDate(orderDetails.getShipDate());
        }
        // Always update status if provided (even if it's the same value)
        String incomingStatus = orderDetails.getStatus();
        if (incomingStatus != null) {
            logger.info("Updating order status from '{}' to '{}' for order ID: {}", 
                existingOrder.getStatus(), incomingStatus, id);
            existingOrder.setStatus(incomingStatus);
            logger.info("Status updated successfully. Current status: {}", existingOrder.getStatus());
        } else {
            logger.warn("Status is null in orderDetails for order ID: {}", id);
        }
        if (orderDetails.getItems() != null) {
            existingOrder.setItems(orderDetails.getItems());
        }
        if (orderDetails.getTax() != null) {
            existingOrder.setTax(orderDetails.getTax());
        }
        if (orderDetails.getShippingCost() != null) {
            existingOrder.setShippingCost(orderDetails.getShippingCost());
        }
        if (orderDetails.getNotes() != null) {
            existingOrder.setNotes(orderDetails.getNotes());
        }
        if (orderDetails.getJsonData() != null) {
            existingOrder.setJsonData(orderDetails.getJsonData());
        }
        
        // Recalculate totals
        existingOrder.calculateTotals();
        
        saveItems();
        logger.info("Updated order with ID: {}, status: {}", id, existingOrder.getStatus());
        
        // Note: WebSocket broadcast will be handled by OrderService to avoid circular dependency
        return existingOrder;
    }

    public void deleteOrder(String id) {
        deleteById(id);
    }

    public static class OrderNotFoundException extends EntityNotFoundException {
        public OrderNotFoundException(String message) { super(message); }
    }

    public static class OrderAlreadyExistsException extends EntityAlreadyExistsException {
        public OrderAlreadyExistsException(String message) { super(message); }
    }
}

