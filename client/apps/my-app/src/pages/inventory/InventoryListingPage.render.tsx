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
                          onChange={(e) => onAdjustQuantityChange(itemKey, parseInt(e.target.value) || 0)}
                          style={{ width: '80px' }}
                          placeholder="±Qty"
                        />
                        <AxButton
                          variant="primary"
                          size="small"
                          onClick={() => onAdjustInventory(item)}
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

