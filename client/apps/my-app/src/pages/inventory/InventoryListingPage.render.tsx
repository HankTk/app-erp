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
  AxFormGroup,
  AxListbox,
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

const LISTING_TABLE_COLUMNS = [
  { 
    key: 'inventory.productCode',
    label: (l10n: (key: string) => string) => l10n('inventory.productCode'),
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (item: InventoryWithDetails) => item.productCode || '-'
  },
  { 
    key: 'inventory.productName',
    label: (l10n: (key: string) => string) => l10n('inventory.productName'),
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (item: InventoryWithDetails) => item.productName || '-'
  },
  { 
    key: 'inventory.warehouseCode',
    label: (l10n: (key: string) => string) => l10n('inventory.warehouseCode'),
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (item: InventoryWithDetails) => item.warehouseCode || '-'
  },
  { 
    key: 'inventory.warehouseName',
    label: (l10n: (key: string) => string) => l10n('inventory.warehouseName'),
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (item: InventoryWithDetails) => item.warehouseName || '-'
  },
  { 
    key: 'inventory.quantity',
    label: (l10n: (key: string) => string) => l10n('inventory.quantity'),
    align: 'right' as const,
    render: (item: InventoryWithDetails) => (
      <strong style={{ fontSize: 'var(--font-size-lg)' }}>
        {item.quantity ?? 0}
      </strong>
    )
  },
  { 
    key: 'inventory.actions',
    label: (l10n: (key: string) => string) => l10n('common.actions'),
    align: 'center' as const,
    render: (item: InventoryWithDetails, context: ListingRenderContext) => {
      const itemKey = item.id || `${item.productId}-${item.warehouseId}`;
      return (
        <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
          <AxInput
            type="number"
            value={context.adjustQuantities[itemKey] || ''}
            onChange={(e) => context.onAdjustQuantityChange(itemKey, parseInt(e.target.value) || 0)}
            style={{ width: '80px' }}
            placeholder="±Qty"
          />
          <AxButton
            variant="primary"
            size="small"
            onClick={() => context.onAdjustInventory(item)}
            disabled={context.adjusting === itemKey || (context.adjustQuantities[itemKey] || 0) === 0}
          >
            {context.l10n('inventory.adjust')}
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
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
        <AxTable fullWidth>
          <AxTableHead>
            <AxTableRow>
              {LISTING_TABLE_COLUMNS.map((column) => (
                <AxTableHeader key={column.key} align={column.align}>
                  {column.label(l10n)}
                </AxTableHeader>
              ))}
            </AxTableRow>
          </AxTableHead>
          <AxTableBody>
            {inventory.length === 0 ? (
              <AxTableRow>
                <AxTableCell colSpan={LISTING_TABLE_COLUMNS.length} align="center">
                  {l10n('inventory.noInventory')}
                </AxTableCell>
              </AxTableRow>
            ) : (
              inventory.map((item) => {
                const itemKey = item.id || `${item.productId}-${item.warehouseId}`;
                const context: ListingRenderContext = {
                  adjusting,
                  adjustQuantities,
                  onAdjustQuantityChange,
                  onAdjustInventory,
                  l10n,
                };
                return (
                  <AxTableRow key={itemKey}>
                    {LISTING_TABLE_COLUMNS.map((column) => (
                      <AxTableCell key={column.key} align={column.align}>
                        {column.render(item, context)}
                      </AxTableCell>
                    ))}
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

