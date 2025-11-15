package com.edge.entity;

import lombok.Data;
import java.util.Map;

@Data
public class Inventory {
    private String id;
    private String productId;
    private String warehouseId;
    private Integer quantity;
    private Map<String, Object> jsonData;
}

