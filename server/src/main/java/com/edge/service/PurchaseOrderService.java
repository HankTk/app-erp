package com.edge.service;

import com.edge.entity.PurchaseOrder;
import com.edge.entity.PurchaseOrderItem;
import com.edge.entity.Product;
import com.edge.repository.PurchaseOrderRepository;
import com.edge.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class PurchaseOrderService {
    
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired(required = false)
    private WebSocketService webSocketService;
    
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.getAllPurchaseOrders();
    }
    
    public Optional<PurchaseOrder> getPurchaseOrderById(String id) {
        return purchaseOrderRepository.getPurchaseOrderById(id);
    }
    
    public Optional<PurchaseOrder> getPurchaseOrderByOrderNumber(String orderNumber) {
        return purchaseOrderRepository.getPurchaseOrderByOrderNumber(orderNumber);
    }
    
    public List<PurchaseOrder> getPurchaseOrdersBySupplierId(String supplierId) {
        return purchaseOrderRepository.getPurchaseOrdersBySupplierId(supplierId);
    }
    
    public List<PurchaseOrder> getPurchaseOrdersByStatus(String status) {
        return purchaseOrderRepository.getPurchaseOrdersByStatus(status);
    }
    
    public PurchaseOrder createPurchaseOrder(PurchaseOrder po) {
        // Enrich PO items with product information
        enrichPurchaseOrderItems(po);
        PurchaseOrder created = purchaseOrderRepository.createPurchaseOrder(po);
        if (webSocketService != null) {
            webSocketService.broadcastPurchaseOrderUpdate(created);
        }
        return created;
    }
    
    public PurchaseOrder updatePurchaseOrder(String id, PurchaseOrder poDetails) {
        System.out.println("PurchaseOrderService.updatePurchaseOrder - ID: " + id + ", Status: " + poDetails.getStatus());
        // Enrich PO items with product information
        enrichPurchaseOrderItems(poDetails);
        PurchaseOrder updated = purchaseOrderRepository.updatePurchaseOrder(id, poDetails);
        System.out.println("PurchaseOrderService.updatePurchaseOrder - Updated status: " + updated.getStatus());
        
        // Broadcast update via WebSocket
        if (webSocketService != null) {
            webSocketService.broadcastPurchaseOrderUpdate(updated);
        }
        
        return updated;
    }
    
    public PurchaseOrder addPurchaseOrderItem(String poId, String productId, Integer quantity) {
        PurchaseOrder po = purchaseOrderRepository.getPurchaseOrderById(poId)
            .orElseThrow(() -> new RuntimeException("Purchase Order not found with id: " + poId));
        
        Product product = productRepository.getProductById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        // Check if item already exists
        Optional<PurchaseOrderItem> existingItem = po.getItems().stream()
            .filter(item -> productId.equals(item.getProductId()))
            .findFirst();
        
        if (existingItem.isPresent()) {
            // Update quantity
            PurchaseOrderItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            item.calculateLineTotal();
        } else {
            // Create new item
            PurchaseOrderItem newItem = new PurchaseOrderItem();
            newItem.setId(java.util.UUID.randomUUID().toString());
            newItem.setProductId(product.getId());
            newItem.setProductCode(product.getProductCode());
            newItem.setProductName(product.getProductName());
            newItem.setQuantity(quantity);
            newItem.setUnitPrice(product.getUnitPrice());
            newItem.calculateLineTotal();
            po.getItems().add(newItem);
        }
        
        po.calculateTotals();
        return purchaseOrderRepository.updatePurchaseOrder(poId, po);
    }
    
    public PurchaseOrder updatePurchaseOrderItemQuantity(String poId, String itemId, Integer quantity) {
        PurchaseOrder po = purchaseOrderRepository.getPurchaseOrderById(poId)
            .orElseThrow(() -> new RuntimeException("Purchase Order not found with id: " + poId));
        
        PurchaseOrderItem item = po.getItems().stream()
            .filter(i -> itemId.equals(i.getId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Purchase Order item not found with id: " + itemId));
        
        item.setQuantity(quantity);
        item.calculateLineTotal();
        po.calculateTotals();
        
        return purchaseOrderRepository.updatePurchaseOrder(poId, po);
    }
    
    public PurchaseOrder removePurchaseOrderItem(String poId, String itemId) {
        PurchaseOrder po = purchaseOrderRepository.getPurchaseOrderById(poId)
            .orElseThrow(() -> new RuntimeException("Purchase Order not found with id: " + poId));
        
        boolean removed = po.getItems().removeIf(item -> itemId.equals(item.getId()));
        if (!removed) {
            throw new RuntimeException("Purchase Order item not found with id: " + itemId);
        }
        
        po.calculateTotals();
        return purchaseOrderRepository.updatePurchaseOrder(poId, po);
    }
    
    public void deletePurchaseOrder(String id) {
        purchaseOrderRepository.deletePurchaseOrder(id);
        
        // Broadcast deletion via WebSocket
        if (webSocketService != null) {
            webSocketService.broadcastPurchaseOrderDelete(id);
        }
    }
    
    public String generateNextInvoiceNumber() {
        return purchaseOrderRepository.generateNextInvoiceNumber();
    }
    
    private void enrichPurchaseOrderItems(PurchaseOrder po) {
        if (po.getItems() != null) {
            for (PurchaseOrderItem item : po.getItems()) {
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

