package com.edge.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class Product {
    private String id;
    private String productCode;
    private String productName;
    private String description;
    private BigDecimal unitPrice;
    private String unitOfMeasure;
    private boolean active;
    private Map<String, Object> jsonData;
}

