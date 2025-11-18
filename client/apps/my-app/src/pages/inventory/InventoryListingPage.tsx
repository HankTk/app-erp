import { useState, useEffect } from 'react';
import {
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxListbox,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import {
  fetchInventory,
  fetchInventoryByWarehouseId,
  adjustInventory,
  Inventory,
} from '../../api/inventoryApi';
import { fetchWarehouses, Warehouse } from '../../api/warehouseApi';
import { fetchProducts, Product } from '../../api/productApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'InventoryListingPage';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg);
  box-sizing: border-box;
  flex: 1;
`;

const HeaderCard = styled(AxCard)`
  flex-shrink: 0;
  padding: var(--spacing-md) var(--spacing-lg) !important;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  gap: var(--spacing-md);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const TableCard = styled(AxCard)`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: calc(100% - 6rem);
  overflow: hidden;
`;


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

  if (loading) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
          <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
            <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
              {onNavigateBack && (
                <AxButton 
                  variant="secondary" 
                  onClick={onNavigateBack}
                  style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                >
                  ← {l10n('common.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('inventory.inventory')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {l10n('inventory.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
                <AxListbox
                  options={warehouseOptions}
                  value={selectedWarehouseId}
                  onChange={(value) => setSelectedWarehouseId(Array.isArray(value) ? value[0] : value)}
                />
              </AxFormGroup>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('common.loading')}</AxParagraph>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
          <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
            <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
              {onNavigateBack && (
                <AxButton 
                  variant="secondary" 
                  onClick={onNavigateBack}
                  style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                >
                  ← {l10n('common.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('inventory.inventory')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {l10n('inventory.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
                <AxListbox
                  options={warehouseOptions}
                  value={selectedWarehouseId}
                  onChange={(value) => setSelectedWarehouseId(Array.isArray(value) ? value[0] : value)}
                />
              </AxFormGroup>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={loadData}>
              {l10n('common.retry')}
            </AxButton>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
      <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
        <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
          <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
            {onNavigateBack && (
              <AxButton 
                variant="secondary" 
                onClick={onNavigateBack}
                style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              >
                ← {l10n('common.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('inventory.inventory')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('inventory.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                options={warehouseOptions}
                value={selectedWarehouseId}
                onChange={(value) => setSelectedWarehouseId(Array.isArray(value) ? value[0] : value)}
              />
            </AxFormGroup>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <AxTable fullWidth variant="bordered">
          <AxTableHead>
            <AxTableRow>
              <AxTableHeader>{l10n('inventory.productCode')}</AxTableHeader>
              <AxTableHeader>{l10n('inventory.productName')}</AxTableHeader>
              <AxTableHeader>{l10n('inventory.warehouseCode')}</AxTableHeader>
              <AxTableHeader>{l10n('inventory.warehouseName')}</AxTableHeader>
              <AxTableHeader align="right" style={{ paddingRight: 'var(--spacing-xl)' }}>{l10n('inventory.quantity')}</AxTableHeader>
              <AxTableHeader align="center" style={{ paddingLeft: 'var(--spacing-xl)' }}>{l10n('common.actions')}</AxTableHeader>
            </AxTableRow>
          </AxTableHead>
          <AxTableBody>
            {inventory.length === 0 ? (
              <AxTableRow>
                <AxTableCell colSpan={6} align="center">
                  {l10n('inventory.noInventory')}
                </AxTableCell>
              </AxTableRow>
            ) : (
              inventory.map((item) => {
                const itemKey = item.id || `${item.productId}-${item.warehouseId}`;
                return (
                  <AxTableRow key={itemKey}>
                    <AxTableCell>{item.productCode || '-'}</AxTableCell>
                    <AxTableCell>{item.productName || '-'}</AxTableCell>
                    <AxTableCell>{item.warehouseCode || '-'}</AxTableCell>
                    <AxTableCell>{item.warehouseName || '-'}</AxTableCell>
                    <AxTableCell align="right" style={{ paddingRight: 'var(--spacing-xl)' }}>
                      <strong style={{ fontSize: 'var(--font-size-lg)' }}>
                        {item.quantity ?? 0}
                      </strong>
                    </AxTableCell>
                    <AxTableCell align="center" style={{ paddingLeft: 'var(--spacing-xl)' }}>
                      <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
                        <AxInput
                          type="number"
                          value={adjustQuantities[itemKey] || ''}
                          onChange={(e) => setAdjustQuantities({ ...adjustQuantities, [itemKey]: parseInt(e.target.value) || 0 })}
                          style={{ width: '80px' }}
                          placeholder="±Qty"
                        />
                        <AxButton
                          variant="primary"
                          size="small"
                          onClick={() => handleAdjustInventory(item)}
                          disabled={adjusting === itemKey || (adjustQuantities[itemKey] || 0) === 0}
                        >
                          {l10n('inventory.adjust')}
                        </AxButton>
                      </div>
                    </AxTableCell>
                  </AxTableRow>
                );
              })
            )}
          </AxTableBody>
        </AxTable>
      </TableCard>
    </PageContainer>
  );
}

