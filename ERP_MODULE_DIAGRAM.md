# ERP System Main Module Relationship Diagram

## Overall System Architecture Diagram

```mermaid
graph TB
    subgraph "Master Data Management"
        direction TB
        Customer[Customer<br/>Customer]
        Vendor[Vendor<br/>Vendor]
        Product[Product<br/>Product]
        Warehouse[Warehouse<br/>Warehouse]
        Address[Address<br/>Address]
        User[User<br/>User]
    end

    subgraph "Sales Cycle"
        direction TB
        OE[Order Entry<br/>Order Entry<br/>O/E]
        OE_WF[Workflow:<br/>Draft→Approval→<br/>Confirmation→Shipping<br/>→Invoicing→History]
        OE --> OE_WF
    end

    subgraph "Procurement Cycle"
        direction TB
        PO[Purchase Order<br/>Purchase Order<br/>P/O]
        PO_WF[Workflow:<br/>Draft→Approval→<br/>Received→Invoicing]
        PO --> PO_WF
    end

    subgraph "Inventory Management"
        direction TB
        IC[Inventory Control<br/>Inventory Control<br/>I/C]
        IC_Adjust[Inventory Adjustment Function]
        IC --> IC_Adjust
    end

    subgraph "Financial Management"
        direction TB
        AR[Accounts Receivable<br/>Accounts Receivable<br/>A/R]
        AP[Accounts Payable<br/>Accounts Payable<br/>A/P]
        GL[General Ledger<br/>General Ledger<br/>G/L]
        Reports[Financial Reports<br/>Financial Reports]
    end

    subgraph "Returns & Manufacturing Management"
        direction TB
        RMA[Return Management<br/>RMA]
        RMA_WF[Workflow:<br/>Draft→Approval→<br/>Received→Processed]
        RMA --> RMA_WF
        SFC[Shop Floor Control<br/>Shop Floor Control<br/>SFC]
    end

    %% Master data relationships
    Customer --> OE
    Product --> OE
    Product --> PO
    Vendor --> PO
    Address --> OE
    Address --> PO
    Warehouse --> IC
    Product --> IC

    %% Sales cycle flow
    OE -->|On Shipment<br/>Status: SHIPPED| IC_Decrease[Inventory Decrease<br/>Automatic Process]
    OE -->|On Invoicing<br/>Status: INVOICED| AR
    OE -->|Linkable| RMA

    %% Procurement cycle flow
    PO -->|On Receipt<br/>Status: RECEIVED| IC_Increase[Inventory Increase<br/>Automatic Process]
    PO -->|On Invoicing<br/>Status: INVOICED| AP

    %% Integration with inventory management
    IC_Decrease --> IC
    IC_Increase --> IC
    RMA -->|On Receipt<br/>Status: RECEIVED| IC_Restock[Inventory Restocking<br/>Automatic Process]
    IC_Restock --> IC
    SFC -.->|Production Data| IC

    %% Financial management flow
    AR -->|Revenue & Payment Records| GL
    AP -->|Expense & Payment Records| GL
    GL -->|Aggregated Data| Reports

    %% Return management relationships
    RMA -->|Link to Original Order| OE

    %% Style settings
    style Customer fill:#e3f2fd
    style Vendor fill:#e3f2fd
    style Product fill:#e3f2fd
    style Warehouse fill:#e3f2fd
    style Address fill:#e3f2fd
    style User fill:#e3f2fd

    style OE fill:#e1f5ff
    style PO fill:#fff4e1
    style IC fill:#e8f5e9
    style AR fill:#f3e5f5
    style AP fill:#fce4ec
    style GL fill:#fff9c4
    style RMA fill:#e0f2f1
    style SFC fill:#f1f8e9
    style Reports fill:#f5f5f5
```

## Data Flow Detail Diagram

```mermaid
sequenceDiagram
    participant Customer as Customer
    participant OE as Order Entry<br/>O/E
    participant IC as Inventory Control<br/>I/C
    participant AR as Accounts Receivable<br/>A/R
    participant GL as General Ledger<br/>G/L

    participant Vendor as Vendor
    participant PO as Purchase Order<br/>P/O
    participant AP as Accounts Payable<br/>A/P

    Note over Customer,GL: Sales Cycle
    Customer->>OE: Create Order
    OE->>OE: Approval Process
    OE->>OE: Shipping Instruction
    OE->>IC: On Shipment: Automatic Inventory Decrease
    OE->>AR: On Invoicing: Create Accounts Receivable
    AR->>GL: Revenue Record
    Customer->>AR: Payment
    AR->>GL: Payment Record

    Note over Vendor,AP: Procurement Cycle
    Vendor->>PO: Create Purchase Order
    PO->>PO: Approval Process
    PO->>IC: On Receipt: Automatic Inventory Increase
    Vendor->>PO: Delivery
    PO->>AP: On Invoicing: Create Accounts Payable
    AP->>GL: Expense Record
    AP->>Vendor: Payment
    AP->>GL: Payment Record

    Note over GL: Financial Report Generation
    GL->>GL: Revenue, Expense & Net Income Calculation
```

## Automatic Process Triggers Between Modules

```mermaid
graph LR
    subgraph "Order Entry O/E"
        OE_Status[Status Management]
        OE_SHIPPED[SHIPPED]
        OE_INVOICED[INVOICED]
    end

    subgraph "Purchase Order P/O"
        PO_Status[Status Management]
        PO_RECEIVED[RECEIVED]
        PO_INVOICED[INVOICED]
    end

    subgraph "Return Management RMA"
        RMA_Status[Status Management]
        RMA_RECEIVED[RECEIVED]
        RMA_PROCESSED[PROCESSED]
    end

    subgraph "Automatic Processes"
        Auto_IC_Dec[Automatic Inventory Decrease]
        Auto_IC_Inc[Automatic Inventory Increase]
        Auto_IC_Restock[Inventory Restocking]
        Auto_AR[Create Accounts Receivable]
        Auto_AP[Create Accounts Payable]
    end

    OE_SHIPPED -->|Trigger| Auto_IC_Dec
    OE_INVOICED -->|Trigger| Auto_AR
    PO_RECEIVED -->|Trigger| Auto_IC_Inc
    PO_INVOICED -->|Trigger| Auto_AP
    RMA_RECEIVED -->|Trigger| Auto_IC_Restock
    RMA_PROCESSED -->|Trigger| Auto_IC_Restock

    style OE_SHIPPED fill:#e1f5ff
    style OE_INVOICED fill:#e1f5ff
    style PO_RECEIVED fill:#fff4e1
    style PO_INVOICED fill:#fff4e1
    style RMA_RECEIVED fill:#e0f2f1
    style RMA_PROCESSED fill:#e0f2f1
    style Auto_IC_Dec fill:#ffebee
    style Auto_IC_Inc fill:#e8f5e9
    style Auto_IC_Restock fill:#e8f5e9
    style Auto_AR fill:#f3e5f5
    style Auto_AP fill:#fce4ec
```

## Financial Integration Flow

```mermaid
graph TB
    subgraph "Revenue Cycle"
        OE[Order Entry]
        Invoice[Invoice Issuance]
        AR[Accounts Receivable]
        Payment[Payment Processing]
    end

    subgraph "Expense Cycle"
        PO[Purchase Order]
        PO_Invoice[Vendor Invoice]
        AP[Accounts Payable]
        PO_Payment[Payment Processing]
    end

    subgraph "Financial Integration"
        GL[General Ledger]
        GL_Revenue[Revenue Items]
        GL_Expense[Expense Items]
        GL_Payment[Payment Items]
        NetIncome[Net Income Calculation]
    end

    OE --> Invoice
    Invoice --> AR
    AR --> Payment
    AR -->|Revenue Data| GL_Revenue
    Payment -->|Payment Data| GL_Payment

    PO --> PO_Invoice
    PO_Invoice --> AP
    AP --> PO_Payment
    AP -->|Expense Data| GL_Expense
    PO_Payment -->|Payment Data| GL_Payment

    GL_Revenue --> GL
    GL_Expense --> GL
    GL_Payment --> GL
    GL --> NetIncome

    style OE fill:#e1f5ff
    style AR fill:#f3e5f5
    style PO fill:#fff4e1
    style AP fill:#fce4ec
    style GL fill:#fff9c4
    style NetIncome fill:#c8e6c9
```

## Inventory Management Integration Flow

```mermaid
graph TB
    subgraph "Inventory Increase Factors"
        PO_Received[Purchase Order Receipt<br/>P/O: RECEIVED]
        RMA_Received[Return Receipt<br/>RMA: RECEIVED]
        SFC_Production[Production Completion<br/>SFC]
        Manual_Adjust[Manual Adjustment]
    end

    subgraph "Inventory Decrease Factors"
        OE_Shipped[Order Shipment<br/>O/E: SHIPPED]
        Manual_Decrease[Manual Adjustment]
    end

    subgraph "Inventory Control I/C"
        IC[Inventory Control System]
        IC_ByWarehouse[Inventory by Warehouse]
        IC_ByProduct[Inventory by Product]
        IC_Adjustment[Inventory Adjustment Function]
    end

    PO_Received -->|Automatic Increase| IC
    RMA_Received -->|Automatic Restocking| IC
    SFC_Production -.->|Production Data| IC
    Manual_Adjust -->|Manual Adjustment| IC_Adjustment

    OE_Shipped -->|Automatic Decrease| IC
    Manual_Decrease -->|Manual Adjustment| IC_Adjustment

    IC --> IC_ByWarehouse
    IC --> IC_ByProduct
    IC_Adjustment --> IC

    style PO_Received fill:#fff4e1
    style RMA_Received fill:#e0f2f1
    style OE_Shipped fill:#e1f5ff
    style IC fill:#e8f5e9
    style IC_Adjustment fill:#ffebee
```

## Module Dependency Map

```mermaid
graph TD
    subgraph "Core Modules"
        Master[Master Management]
        IC[Inventory Control]
        GL[General Ledger]
    end

    subgraph "Business Modules"
        OE[Order Entry]
        PO[Purchase Order]
        AR[Accounts Receivable]
        AP[Accounts Payable]
        RMA[Return Management]
        SFC[Shop Floor Control]
    end

    Master --> OE
    Master --> PO
    Master --> IC
    Master --> RMA

    OE --> IC
    OE --> AR
    OE --> RMA

    PO --> IC
    PO --> AP

    RMA --> IC
    RMA --> OE

    AR --> GL
    AP --> GL

    SFC -.-> IC

    style Master fill:#e3f2fd
    style IC fill:#e8f5e9
    style GL fill:#fff9c4
    style OE fill:#e1f5ff
    style PO fill:#fff4e1
    style AR fill:#f3e5f5
    style AP fill:#fce4ec
    style RMA fill:#e0f2f1
    style SFC fill:#f1f8e9
```

## Workflow State Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft: Create

    state "Order Entry O/E" as OE {
        Draft --> Approval: Submit
        Approval --> Confirmation: Approve
        Confirmation --> ShippingInstruction: Confirm
        ShippingInstruction --> Shipping: Shipping Instruction
        Shipping --> Invoicing: Shipment Complete
        Invoicing --> History: Invoicing Complete
        History --> [*]
    }

    state "Purchase Order P/O" as PO {
        [*] --> Draft: Create
        Draft --> Approval: Submit
        Approval --> Received: Approve
        Received --> Invoicing: Receipt Complete
        Invoicing --> History: Invoicing Complete
        History --> [*]
    }

    state "Return Management RMA" as RMA {
        [*] --> Draft: Create
        Draft --> PendingApproval: Submit
        PendingApproval --> Approved: Approve
        Approved --> Received: Return Receipt
        Received --> Processed: Processing Complete
        Processed --> [*]
        
        Draft --> Cancelled: Cancel
        PendingApproval --> Cancelled: Cancel
        Approved --> Cancelled: Cancel
        Received --> Cancelled: Cancel
        Cancelled --> [*]
    }

    note right of Shipping
        Automatic Inventory Decrease
    end note

    note right of Received
        Automatic Inventory Increase
    end note

    note right of Invoicing
        Create Accounts Receivable/Payable
    end note
```

## Module List Table

| Module | Abbreviation | Main Functions | Automatic Process Triggers |
|--------|-------------|----------------|---------------------------|
| **Order Entry** | O/E | Full lifecycle management of customer orders | SHIPPED → Inventory Decrease<br/>INVOICED → Create Accounts Receivable |
| **Purchase Order** | P/O | Full lifecycle management of vendor orders | RECEIVED → Inventory Increase<br/>INVOICED → Create Accounts Payable |
| **Inventory Control** | I/C | Warehouse and product-based inventory tracking and adjustment | Auto-update from Orders, Purchase Orders, and RMA |
| **Accounts Receivable** | A/R | Customer invoice and payment management | Auto-created on order invoicing |
| **Accounts Payable** | A/P | Vendor invoice and payment management | Auto-created on purchase order invoicing |
| **General Ledger** | G/L | Aggregation and reporting of all financial transactions | Auto-aggregation from Accounts Receivable and Payable |
| **Return Management** | RMA | Approval and processing of customer returns | RECEIVED → Inventory Restocking |
| **Shop Floor Control** | SFC | Manufacturing and production operations management | Production Data → Inventory Update |
| **Master Management** | - | Basic data for customers, products, vendors, warehouses, etc. | - |

---

**Created**: 2024
**System**: ERP System (my-app)
**Version**: v2.3.0+
