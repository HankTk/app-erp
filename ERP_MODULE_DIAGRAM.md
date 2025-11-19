# ERPシステム 主要モジュール関連図

## システム全体アーキテクチャ図

```mermaid
graph TB
    subgraph "マスタデータ管理"
        direction TB
        Customer[顧客<br/>Customer]
        Vendor[仕入先<br/>Vendor]
        Product[商品<br/>Product]
        Warehouse[倉庫<br/>Warehouse]
        Address[住所<br/>Address]
        User[ユーザー<br/>User]
    end

    subgraph "販売サイクル"
        direction TB
        OE[受注管理<br/>Order Entry<br/>O/E]
        OE_WF[ワークフロー:<br/>Draft→Approval→<br/>Confirmation→Shipping<br/>→Invoicing→History]
        OE --> OE_WF
    end

    subgraph "購買サイクル"
        direction TB
        PO[発注管理<br/>Purchase Order<br/>P/O]
        PO_WF[ワークフロー:<br/>Draft→Approval→<br/>Received→Invoicing]
        PO --> PO_WF
    end

    subgraph "在庫管理"
        direction TB
        IC[在庫管理<br/>Inventory Control<br/>I/C]
        IC_Adjust[在庫調整機能]
        IC --> IC_Adjust
    end

    subgraph "財務管理"
        direction TB
        AR[売掛金管理<br/>Accounts Receivable<br/>A/R]
        AP[買掛金管理<br/>Accounts Payable<br/>A/P]
        GL[総勘定元帳<br/>General Ledger<br/>G/L]
        Reports[財務レポート<br/>Financial Reports]
    end

    subgraph "返品・製造管理"
        direction TB
        RMA[返品管理<br/>RMA]
        RMA_WF[ワークフロー:<br/>Draft→Approval→<br/>Received→Processed]
        RMA --> RMA_WF
        SFC[製造現場管理<br/>Shop Floor Control<br/>SFC]
    end

    %% マスタデータの関係
    Customer --> OE
    Product --> OE
    Product --> PO
    Vendor --> PO
    Address --> OE
    Address --> PO
    Warehouse --> IC
    Product --> IC

    %% 販売サイクルの流れ
    OE -->|出荷時<br/>Status: SHIPPED| IC_Decrease[在庫減少<br/>自動処理]
    OE -->|請求時<br/>Status: INVOICED| AR
    OE -->|リンク可能| RMA

    %% 購買サイクルの流れ
    PO -->|受入時<br/>Status: RECEIVED| IC_Increase[在庫増加<br/>自動処理]
    PO -->|請求時<br/>Status: INVOICED| AP

    %% 在庫管理への統合
    IC_Decrease --> IC
    IC_Increase --> IC
    RMA -->|受入時<br/>Status: RECEIVED| IC_Restock[在庫再入庫<br/>自動処理]
    IC_Restock --> IC
    SFC -.->|生産データ| IC

    %% 財務管理の流れ
    AR -->|収益・支払記録| GL
    AP -->|費用・支払記録| GL
    GL -->|集計データ| Reports

    %% 返品管理の関係
    RMA -->|元の受注にリンク| OE

    %% スタイル設定
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

## データフロー詳細図

```mermaid
sequenceDiagram
    participant Customer as 顧客
    participant OE as 受注管理<br/>O/E
    participant IC as 在庫管理<br/>I/C
    participant AR as 売掛金<br/>A/R
    participant GL as 総勘定元帳<br/>G/L

    participant Vendor as 仕入先
    participant PO as 発注管理<br/>P/O
    participant AP as 買掛金<br/>A/P

    Note over Customer,GL: 販売サイクル
    Customer->>OE: 受注作成
    OE->>OE: 承認プロセス
    OE->>OE: 出荷指示
    OE->>IC: 出荷時: 在庫自動減少
    OE->>AR: 請求時: 売掛金作成
    AR->>GL: 収益記録
    Customer->>AR: 支払い
    AR->>GL: 支払記録

    Note over Vendor,AP: 購買サイクル
    Vendor->>PO: 発注作成
    PO->>PO: 承認プロセス
    PO->>IC: 受入時: 在庫自動増加
    Vendor->>PO: 納品
    PO->>AP: 請求時: 買掛金作成
    AP->>GL: 費用記録
    AP->>Vendor: 支払い
    AP->>GL: 支払記録

    Note over GL: 財務レポート生成
    GL->>GL: 収益・費用・純利益計算
```

## モジュール間の自動処理トリガー

```mermaid
graph LR
    subgraph "受注管理 O/E"
        OE_Status[ステータス管理]
        OE_SHIPPED[SHIPPED]
        OE_INVOICED[INVOICED]
    end

    subgraph "発注管理 P/O"
        PO_Status[ステータス管理]
        PO_RECEIVED[RECEIVED]
        PO_INVOICED[INVOICED]
    end

    subgraph "返品管理 RMA"
        RMA_Status[ステータス管理]
        RMA_RECEIVED[RECEIVED]
        RMA_PROCESSED[PROCESSED]
    end

    subgraph "自動処理"
        Auto_IC_Dec[在庫自動減少]
        Auto_IC_Inc[在庫自動増加]
        Auto_IC_Restock[在庫再入庫]
        Auto_AR[売掛金作成]
        Auto_AP[買掛金作成]
    end

    OE_SHIPPED -->|トリガー| Auto_IC_Dec
    OE_INVOICED -->|トリガー| Auto_AR
    PO_RECEIVED -->|トリガー| Auto_IC_Inc
    PO_INVOICED -->|トリガー| Auto_AP
    RMA_RECEIVED -->|トリガー| Auto_IC_Restock
    RMA_PROCESSED -->|トリガー| Auto_IC_Restock

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

## 財務統合フロー

```mermaid
graph TB
    subgraph "収益サイクル"
        OE[受注管理]
        Invoice[請求書発行]
        AR[売掛金管理]
        Payment[入金処理]
    end

    subgraph "費用サイクル"
        PO[発注管理]
        PO_Invoice[仕入先請求書]
        AP[買掛金管理]
        PO_Payment[支払処理]
    end

    subgraph "財務統合"
        GL[総勘定元帳]
        GL_Revenue[収益項目]
        GL_Expense[費用項目]
        GL_Payment[支払項目]
        NetIncome[純利益計算]
    end

    OE --> Invoice
    Invoice --> AR
    AR --> Payment
    AR -->|収益データ| GL_Revenue
    Payment -->|支払データ| GL_Payment

    PO --> PO_Invoice
    PO_Invoice --> AP
    AP --> PO_Payment
    AP -->|費用データ| GL_Expense
    PO_Payment -->|支払データ| GL_Payment

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

## 在庫管理統合フロー

```mermaid
graph TB
    subgraph "在庫増加要因"
        PO_Received[発注受入<br/>P/O: RECEIVED]
        RMA_Received[返品受入<br/>RMA: RECEIVED]
        SFC_Production[生産完了<br/>SFC]
        Manual_Adjust[手動調整]
    end

    subgraph "在庫減少要因"
        OE_Shipped[受注出荷<br/>O/E: SHIPPED]
        Manual_Decrease[手動調整]
    end

    subgraph "在庫管理 I/C"
        IC[在庫管理システム]
        IC_ByWarehouse[倉庫別在庫]
        IC_ByProduct[商品別在庫]
        IC_Adjustment[在庫調整機能]
    end

    PO_Received -->|自動増加| IC
    RMA_Received -->|自動再入庫| IC
    SFC_Production -.->|生産データ| IC
    Manual_Adjust -->|手動調整| IC_Adjustment

    OE_Shipped -->|自動減少| IC
    Manual_Decrease -->|手動調整| IC_Adjustment

    IC --> IC_ByWarehouse
    IC --> IC_ByProduct
    IC_Adjustment --> IC

    style PO_Received fill:#fff4e1
    style RMA_Received fill:#e0f2f1
    style OE_Shipped fill:#e1f5ff
    style IC fill:#e8f5e9
    style IC_Adjustment fill:#ffebee
```

## モジュール依存関係マップ

```mermaid
graph TD
    subgraph "コアモジュール"
        Master[マスタ管理]
        IC[在庫管理]
        GL[総勘定元帳]
    end

    subgraph "業務モジュール"
        OE[受注管理]
        PO[発注管理]
        AR[売掛金]
        AP[買掛金]
        RMA[返品管理]
        SFC[製造現場管理]
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

## ワークフロー状態遷移図

```mermaid
stateDiagram-v2
    [*] --> Draft: 作成

    state "受注管理 O/E" as OE {
        Draft --> Approval: 提出
        Approval --> Confirmation: 承認
        Confirmation --> ShippingInstruction: 確認
        ShippingInstruction --> Shipping: 出荷指示
        Shipping --> Invoicing: 出荷完了
        Invoicing --> History: 請求完了
        History --> [*]
    }

    state "発注管理 P/O" as PO {
        [*] --> Draft: 作成
        Draft --> Approval: 提出
        Approval --> Received: 承認
        Received --> Invoicing: 受入完了
        Invoicing --> History: 請求完了
        History --> [*]
    }

    state "返品管理 RMA" as RMA {
        [*] --> Draft: 作成
        Draft --> PendingApproval: 提出
        PendingApproval --> Approved: 承認
        Approved --> Received: 返品受入
        Received --> Processed: 処理完了
        Processed --> [*]
        
        Draft --> Cancelled: キャンセル
        PendingApproval --> Cancelled: キャンセル
        Approved --> Cancelled: キャンセル
        Received --> Cancelled: キャンセル
        Cancelled --> [*]
    }

    note right of Shipping
        在庫自動減少
    end note

    note right of Received
        在庫自動増加
    end note

    note right of Invoicing
        売掛金/買掛金作成
    end note
```

## モジュール一覧表

| モジュール | 略称 | 主要機能 | 自動処理トリガー |
|----------|------|---------|----------------|
| **受注管理** | O/E | 顧客受注の全ライフサイクル管理 | SHIPPED → 在庫減少<br/>INVOICED → 売掛金作成 |
| **発注管理** | P/O | 仕入先発注の全ライフサイクル管理 | RECEIVED → 在庫増加<br/>INVOICED → 買掛金作成 |
| **在庫管理** | I/C | 倉庫別・商品別在庫追跡・調整 | 受注・発注・RMAから自動更新 |
| **売掛金管理** | A/R | 顧客請求書・入金管理 | 受注請求時自動作成 |
| **買掛金管理** | A/P | 仕入先請求書・支払管理 | 発注請求時自動作成 |
| **総勘定元帳** | G/L | 全財務取引の集約・レポート | 売掛金・買掛金から自動集計 |
| **返品管理** | RMA | 顧客返品の承認・処理 | RECEIVED → 在庫再入庫 |
| **製造現場管理** | SFC | 製造・生産オペレーション管理 | 生産データ → 在庫更新 |
| **マスタ管理** | - | 顧客・商品・仕入先・倉庫等の基本データ | - |

---

**作成日**: 2024年
**システム**: ERP System (my-app)
**バージョン**: v2.3.0+

