import {
  AxTable,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxInput,
  AxFormGroup,
  AxListbox,
  ColumnDefinition,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { debugProps } from '../../utils/emotionCache';
import { Inventory } from '../../api/inventoryApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './InventoryListingPage.styles';

const COMPONENT_NAME = 'InventoryListingPage';

interface InventoryWithDetails extends Inventory {
  productName?: string;
  productCode?: string;
  warehouseName?: string;
  warehouseCode?: string;
}

type ListingRenderContext = {
  adjusting: string | null;
  adjustQuantities: Record<string, number>;
  onAdjustQuantityChange: (itemKey: string, value: number) => void;
  onAdjustInventory: (item: InventoryWithDetails) => void;
  l10n: (key: string) => string;
};

const createColumns = (l10n: (key: string) => string): ColumnDefinition<InventoryWithDetails, ListingRenderContext>[] => [
  { 
    key: 'inventory.productCode',
    header: l10n('inventory.productCode'),
    align: undefined,
    render: (item: InventoryWithDetails) => item.productCode || '-'
  },
  { 
    key: 'inventory.productName',
    header: l10n('inventory.productName'),
    align: undefined,
    render: (item: InventoryWithDetails) => item.productName || '-'
  },
  { 
    key: 'inventory.warehouseCode',
    header: l10n('inventory.warehouseCode'),
    align: undefined,
    render: (item: InventoryWithDetails) => item.warehouseCode || '-'
  },
  { 
    key: 'inventory.warehouseName',
    header: l10n('inventory.warehouseName'),
    align: undefined,
    render: (item: InventoryWithDetails) => item.warehouseName || '-'
  },
  { 
    key: 'inventory.quantity',
    header: l10n('inventory.quantity'),
    align: 'right',
    render: (item: InventoryWithDetails) => (
      <strong style={{ fontSize: 'var(--font-size-lg)' }}>
        {item.quantity ?? 0}
      </strong>
    )
  },
  { 
    key: 'inventory.actions',
    header: l10n('common.actions'),
    align: 'center',
    render: (item: InventoryWithDetails, context) => {
      const itemKey = item.id || `${item.productId}-${item.warehouseId}`;
      return (
        <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
          <AxInput
            type="number"
            value={context?.adjustQuantities[itemKey] || ''}
            onChange={(e) => context?.onAdjustQuantityChange(itemKey, parseInt(e.target.value) || 0)}
            style={{ width: '80px' }}
            placeholder="±Qty"
          />
          <AxButton
            variant="primary"
            size="small"
            onClick={() => context?.onAdjustInventory(item)}
            disabled={context?.adjusting === itemKey || (context?.adjustQuantities[itemKey] || 0) === 0}
          >
            {context?.l10n('inventory.adjust')}
          </AxButton>
        </div>
      );
    }
  },
];

interface InventoryListingPageRenderProps {
  inventory: InventoryWithDetails[];
  loading: boolean;
  error: string | null;
  selectedWarehouseId: string;
  warehouseOptions: Array<{ value: string; label: string }>;
  adjusting: string | null;
  adjustQuantities: Record<string, number>;
  onNavigateBack?: () => void;
  onWarehouseChange: (value: string) => void;
  onAdjustQuantityChange: (itemKey: string, value: number) => void;
  onAdjustInventory: (item: InventoryWithDetails) => void;
  onRetry: () => void;
}

export function InventoryListingPageRender(props: InventoryListingPageRenderProps) {
  const {
    inventory,
    loading,
    error,
    selectedWarehouseId,
    warehouseOptions,
    adjusting,
    adjustQuantities,
    onNavigateBack,
    onWarehouseChange,
    onAdjustQuantityChange,
    onAdjustInventory,
    onRetry,
  } = props;
  
  const { l10n } = useI18n();
  const columns = createColumns(l10n);
  const tableContext: ListingRenderContext = {
    adjusting,
    adjustQuantities,
    onAdjustQuantityChange,
    onAdjustInventory,
    l10n,
  };

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
                <AxParagraph color="secondary">
                  {l10n('inventory.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
                <AxListbox
                  options={warehouseOptions}
                  value={selectedWarehouseId}
                  onChange={(value) => onWarehouseChange(Array.isArray(value) ? value[0] : value)}
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
                <AxParagraph color="secondary">
                  {l10n('inventory.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
                <AxListbox
                  options={warehouseOptions}
                  value={selectedWarehouseId}
                  onChange={(value) => onWarehouseChange(Array.isArray(value) ? value[0] : value)}
                />
              </AxFormGroup>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph color="error">Error: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={onRetry}>
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
                onChange={(value) => onWarehouseChange(Array.isArray(value) ? value[0] : value)}
              />
            </AxFormGroup>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        {inventory.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('inventory.noInventory')}</AxParagraph>
          </div>
        ) : (
          <AxTable
            fullWidth
            stickyHeader
            data={inventory}
            columns={columns}
            context={tableContext}
            getRowKey={(item) => item.id || `${item.productId}-${item.warehouseId}`}
          />
        )}
      </TableCard>
    </PageContainer>
  );
}

