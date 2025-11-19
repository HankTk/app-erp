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
  AxDialog,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxCheckbox,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { debugProps } from '../../utils/emotionCache';
import { Warehouse } from '../../api/warehouseApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './WarehouseListingPage.styles';

const COMPONENT_NAME = 'WarehouseListingPage';

type DialogMode = 'add' | 'edit' | null;

type ListingRenderContext = {
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  l10n: (key: string) => string;
};

const LISTING_TABLE_COLUMNS = [
  { 
    key: 'warehouse.warehouseCode',
    label: (l10n: (key: string) => string) => l10n('inventory.warehouseCode'),
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (warehouse: Warehouse) => warehouse.warehouseCode || '-'
  },
  { 
    key: 'warehouse.warehouseName',
    label: (l10n: (key: string) => string) => l10n('inventory.warehouseName'),
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (warehouse: Warehouse) => warehouse.warehouseName || '-'
  },
  { 
    key: 'warehouse.address',
    label: (l10n: (key: string) => string) => l10n('inventory.address'),
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (warehouse: Warehouse) => warehouse.address || '-'
  },
  { 
    key: 'warehouse.status',
    label: (l10n: (key: string) => string) => l10n('common.status'),
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (warehouse: Warehouse, context: ListingRenderContext) => warehouse.active ? (
      <span style={{ color: 'var(--color-success)' }}>{context.l10n('common.active')}</span>
    ) : (
      <span style={{ color: 'var(--color-text-secondary)' }}>{context.l10n('common.inactive')}</span>
    )
  },
  { 
    key: 'warehouse.actions',
    label: (l10n: (key: string) => string) => l10n('common.actions'),
    align: 'center' as const,
    render: (warehouse: Warehouse, context: ListingRenderContext) => (
      <>
        <AxButton
          variant="secondary"
          size="small"
          onClick={() => context.onEdit(warehouse)}
          style={{ marginRight: 'var(--spacing-xs)' }}
        >
          {context.l10n('common.edit')}
        </AxButton>
        <AxButton
          variant="danger"
          size="small"
          onClick={() => context.onDelete(warehouse)}
        >
          {context.l10n('common.delete')}
        </AxButton>
      </>
    )
  },
];

interface WarehouseListingPageRenderProps {
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
  dialogMode: DialogMode;
  deleteDialogOpen: boolean;
  selectedWarehouse: Warehouse | null;
  formData: Partial<Warehouse>;
  submitting: boolean;
  onNavigateBack?: () => void;
  onAdd: () => void;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onSubmit: () => void;
  onDialogClose: () => void;
  onFormDataChange: (data: Partial<Warehouse>) => void;
  onRetry: () => void;
}

export function WarehouseListingPageRender(props: WarehouseListingPageRenderProps) {
  const {
    warehouses,
    loading,
    error,
    dialogMode,
    deleteDialogOpen,
    selectedWarehouse,
    formData,
    submitting,
    onNavigateBack,
    onAdd,
    onEdit,
    onDelete,
    onDeleteConfirm,
    onDeleteCancel,
    onSubmit,
    onDialogClose,
    onFormDataChange,
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
                  {l10n('inventory.warehouses')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {l10n('inventory.warehousesSubtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={onAdd}>
                {l10n('common.add')}
              </AxButton>
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
                  {l10n('inventory.warehouses')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {l10n('inventory.warehousesSubtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={onAdd}>
                {l10n('common.add')}
              </AxButton>
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
                {l10n('inventory.warehouses')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('inventory.warehousesSubtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxButton variant="primary" onClick={onAdd}>
              {l10n('common.add')}
            </AxButton>
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
            {warehouses.map((warehouse) => {
              const context: ListingRenderContext = {
                onEdit,
                onDelete,
                l10n,
              };
              return (
                <AxTableRow key={warehouse.id}>
                  {LISTING_TABLE_COLUMNS.map((column) => (
                    <AxTableCell key={column.key} align={column.align}>
                      {column.render(warehouse, context)}
                    </AxTableCell>
                  ))}
                </AxTableRow>
              );
            })}
          </AxTableBody>
        </AxTable>
      </TableCard>

      <AxDialog
        open={dialogMode !== null}
        onClose={onDialogClose}
        title={dialogMode === 'add' ? l10n('inventory.addWarehouse') : l10n('inventory.editWarehouse')}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton
              variant="secondary"
              onClick={onDialogClose}
              disabled={submitting}
            >
              {l10n('common.cancel')}
            </AxButton>
            <AxButton variant="primary" onClick={onSubmit} disabled={submitting}>
              {submitting ? l10n('common.saving') || 'Saving...' : l10n('common.save')}
            </AxButton>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <AxFormGroup>
            <AxLabel>{l10n('inventory.warehouseCode')} *</AxLabel>
            <AxInput
              value={formData.warehouseCode || ''}
              onChange={(e) => onFormDataChange({ ...formData, warehouseCode: e.target.value })}
              fullWidth
              disabled={submitting}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{l10n('inventory.warehouseName')} *</AxLabel>
            <AxInput
              value={formData.warehouseName || ''}
              onChange={(e) => onFormDataChange({ ...formData, warehouseName: e.target.value })}
              fullWidth
              disabled={submitting}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{l10n('inventory.address')}</AxLabel>
            <AxInput
              value={formData.address || ''}
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
              fullWidth
              disabled={submitting}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{l10n('common.description')}</AxLabel>
            <AxInput
              value={formData.description || ''}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              fullWidth
              disabled={submitting}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxCheckbox
              label={l10n('common.active')}
              checked={formData.active ?? true}
              onChange={(e) => onFormDataChange({ ...formData, active: e.target.checked })}
              disabled={submitting}
            />
          </AxFormGroup>
        </div>
      </AxDialog>

      <AxDialog
        open={deleteDialogOpen}
        onClose={onDeleteCancel}
        title={l10n('common.confirmDelete')}
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton
              variant="secondary"
              onClick={onDeleteCancel}
              disabled={submitting}
            >
              {l10n('common.cancel')}
            </AxButton>
            <AxButton variant="danger" onClick={onDeleteConfirm} disabled={submitting}>
              {submitting ? l10n('common.deleting') || 'Deleting...' : l10n('common.delete')}
            </AxButton>
          </div>
        }
      >
        <p>{l10n('inventory.confirmDeleteWarehouse', { name: selectedWarehouse?.warehouseName })}</p>
      </AxDialog>
    </PageContainer>
  );
}

