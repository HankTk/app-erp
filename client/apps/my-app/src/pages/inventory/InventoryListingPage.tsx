import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import {
  fetchInventory,
  fetchInventoryByWarehouseId,
  adjustInventory,
  Inventory,
} from '../../api/inventoryApi';
import { fetchWarehouses, Warehouse } from '../../api/warehouseApi';
import { fetchProducts, Product } from '../../api/productApi';
import { InventoryListingPageRender } from './InventoryListingPage.render';


interface InventoryListingPageProps {
  onNavigateBack?: () => void;
}

interface InventoryWithDetails extends Inventory {
  productName?: string;
  productCode?: string;
  warehouseName?: string;
  warehouseCode?: string;
}

export function InventoryListingPage({ onNavigateBack }: InventoryListingPageProps = {}) {
  const { l10n } = useI18n();
  const [inventory, setInventory] = useState<InventoryWithDetails[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [adjustQuantities, setAdjustQuantities] = useState<Record<string, number>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [inventoryData, warehousesData, productsData] = await Promise.all([
        selectedWarehouseId === 'all' ? fetchInventory() : fetchInventoryByWarehouseId(selectedWarehouseId),
        fetchWarehouses(),
        fetchProducts(),
      ]);

      // Enrich inventory with product and warehouse details
      const enrichedInventory: InventoryWithDetails[] = inventoryData.map((inv) => {
        const product = productsData.find((p) => p.id === inv.productId);
        const warehouse = warehousesData.find((w) => w.id === inv.warehouseId);
        return {
          ...inv,
          productName: product?.productName,
          productCode: product?.productCode,
          warehouseName: warehouse?.warehouseName,
          warehouseCode: warehouse?.warehouseCode,
        };
      });

      // Always show all product-warehouse combinations
      // Merge existing inventory records with all possible combinations
      if (productsData.length > 0 && warehousesData.length > 0) {
        const allCombinations: InventoryWithDetails[] = [];
        const filteredWarehouses = selectedWarehouseId === 'all' 
          ? warehousesData 
          : warehousesData.filter(w => w.id === selectedWarehouseId);
        
        productsData.forEach(product => {
          filteredWarehouses.forEach(warehouse => {
            // Check if inventory record already exists for this product-warehouse combination
            const existingInventory = enrichedInventory.find(
              inv => inv.productId === product.id && inv.warehouseId === warehouse.id
            );
            
            if (existingInventory) {
              // Use existing inventory record
              allCombinations.push(existingInventory);
            } else {
              // Create new entry with 0 quantity
              allCombinations.push({
                id: undefined,
                productId: product.id,
                warehouseId: warehouse.id,
                quantity: 0,
                productName: product.productName,
                productCode: product.productCode,
                warehouseName: warehouse.warehouseName,
                warehouseCode: warehouse.warehouseCode,
              });
            }
          });
        });
        setInventory(allCombinations);
      } else {
        setInventory(enrichedInventory);
      }
      
      setWarehouses(warehousesData);
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWarehouseId]);

  const handleAdjustInventory = async (inventoryItem: InventoryWithDetails) => {
    if (!inventoryItem.productId || !inventoryItem.warehouseId) {
      return;
    }
    
    // Use a unique key for items without an ID (new inventory records)
    const itemKey = inventoryItem.id || `${inventoryItem.productId}-${inventoryItem.warehouseId}`;
    const quantityChange = adjustQuantities[itemKey] || 0;
    if (quantityChange === 0) {
      return;
    }

    try {
      setAdjusting(itemKey);
      await adjustInventory(inventoryItem.productId, inventoryItem.warehouseId, quantityChange);
      setAdjustQuantities({ ...adjustQuantities, [itemKey]: 0 });
      setAdjusting(null);
      await loadData();
    } catch (err) {
      console.error('Error adjusting inventory:', err);
      alert('Failed to adjust inventory');
      setAdjusting(null);
    }
  };

  const warehouseOptions = [
    { value: 'all', label: l10n('inventory.allWarehouses') },
    ...warehouses.map((w) => ({
      value: w.id || '',
      label: `${w.warehouseCode} - ${w.warehouseName}`,
    })),
  ];

  const handleAdjustQuantityChange = (itemKey: string, value: number) => {
    setAdjustQuantities({ ...adjustQuantities, [itemKey]: value });
  };

  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouseId(value);
  };

  return (
    <InventoryListingPageRender
      inventory={inventory}
      loading={loading}
      error={error}
      selectedWarehouseId={selectedWarehouseId}
      warehouseOptions={warehouseOptions}
      adjusting={adjusting}
      adjustQuantities={adjustQuantities}
      onNavigateBack={onNavigateBack}
      onWarehouseChange={handleWarehouseChange}
      onAdjustQuantityChange={handleAdjustQuantityChange}
      onAdjustInventory={handleAdjustInventory}
      onRetry={loadData}
    />
  );
}

