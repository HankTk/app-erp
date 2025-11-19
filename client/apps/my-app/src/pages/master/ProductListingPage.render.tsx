import {
  AxTable,
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxDialog,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxCheckbox,
  ColumnDefinition,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import { Product } from '../../api/productApi';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './ProductListingPage.styles';

const COMPONENT_NAME = 'ProductListingPage';

type DialogMode = 'add' | 'edit' | null;

type ListingRenderContext = {
  onEdit: (product: Product) => void;
  onDeleteClick: (product: Product) => void;
  l10n: (key: string) => string;
};

const createColumns = (t: (key: string, params?: Record<string, string | number | undefined>) => string): ColumnDefinition<Product, ListingRenderContext>[] => [
  { 
    key: 'product.productCode',
    header: t('product.table.productCode'),
    align: undefined,
    render: (product: Product) => product.productCode || ''
  },
  { 
    key: 'product.productName',
    header: t('product.table.productName'),
    align: undefined,
    render: (product: Product) => product.productName || ''
  },
  { 
    key: 'product.description',
    header: t('product.table.description'),
    align: undefined,
    render: (product: Product) => product.description || ''
  },
  { 
    key: 'product.unitPrice',
    header: t('product.table.unitPrice'),
    align: 'right',
    render: (product: Product) => product.unitPrice !== undefined && product.unitPrice !== null 
      ? `$${product.unitPrice.toFixed(2)}` 
      : ''
  },
  { 
    key: 'product.cost',
    header: t('product.table.cost'),
    align: 'right',
    render: (product: Product) => product.cost !== undefined && product.cost !== null 
      ? `$${product.cost.toFixed(2)}` 
      : '-'
  },
  { 
    key: 'product.unitOfMeasure',
    header: t('product.table.unitOfMeasure'),
    align: undefined,
    render: (product: Product) => product.unitOfMeasure || ''
  },
  { 
    key: 'product.active',
    header: t('product.table.active'),
    align: 'center',
    render: (product: Product, context) => (
      <span style={{ 
        color: product.active ? 'var(--color-success)' : 'var(--color-text-secondary)',
        fontWeight: 500
      }}>
        {product.active ? context?.l10n('product.table.yes') : context?.l10n('product.table.no')}
      </span>
    )
  },
  { 
    key: 'product.actions',
    header: t('generalLedger.table.actions'),
    align: 'center',
    render: (product: Product, context) => (
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
        <AxButton 
          variant="secondary" 
          size="small"
          onClick={() => context?.onEdit(product)}
          style={{ minWidth: '80px' }}
        >
          {context?.l10n('product.table.edit')}
        </AxButton>
        <AxButton 
          variant="danger" 
          size="small"
          onClick={() => context?.onDeleteClick(product)}
          style={{ minWidth: '80px' }}
        >
          {context?.l10n('common.delete')}
        </AxButton>
      </div>
    )
  },
];

interface ProductListingPageRenderProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  dialogMode: DialogMode;
  deleteDialogOpen: boolean;
  selectedProduct: Product | null;
  formData: Partial<Product>;
  submitting: boolean;
  onNavigateBack?: () => void;
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onDeleteClick: (product: Product) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onSave: () => void;
  onDialogClose: () => void;
  onFormDataChange: (data: Partial<Product>) => void;
  onRetry: () => void;
}

export function ProductListingPageRender(props: ProductListingPageRenderProps) {
  const {
    products,
    loading,
    error,
    dialogMode,
    deleteDialogOpen,
    selectedProduct,
    formData,
    submitting,
    onNavigateBack,
    onAdd,
    onEdit,
    onDeleteClick,
    onDeleteConfirm,
    onDeleteCancel,
    onSave,
    onDialogClose,
    onFormDataChange,
    onRetry,
  } = props;

  const { l10n } = useI18n();
  const columns = createColumns(l10n);
  const tableContext: ListingRenderContext = {
    onEdit,
    onDeleteClick,
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
                  {l10n('product.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('product.title')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {l10n('product.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={onAdd}>{l10n('product.addNew')}</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('product.loading')}</AxParagraph>
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
                  {l10n('product.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('product.title')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {l10n('product.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={onAdd}>{l10n('product.addNew')}</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>{l10n('product.error')}: {error}</AxParagraph>
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
                ← Back
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                Products
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                Manage product catalog
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxButton variant="primary" onClick={onAdd}>Add New</AxButton>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {products.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>{l10n('product.noProducts')}</AxParagraph>
            </div>
          ) : (
            <AxTable
              fullWidth
              stickyHeader
              data={products}
              columns={columns}
              context={tableContext}
              getRowKey={(product) => product.id || ''}
            />
          )}
        </div>
      </TableCard>

      {/* Add/Edit Product Dialog */}
      <AxDialog
        open={dialogMode !== null}
        onClose={onDialogClose}
        title={dialogMode === 'add' ? l10n('product.dialog.addTitle') : l10n('product.dialog.editTitle')}
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
            <AxButton 
              variant="primary" 
              onClick={onSave}
              disabled={submitting}
            >
              {submitting ? l10n('common.saving') : l10n('common.save')}
            </AxButton>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <AxFormGroup>
            <AxLabel>{l10n('product.form.productCode')}</AxLabel>
            <AxInput
              type="text"
              value={formData.productCode || ''}
              onChange={(e) => onFormDataChange({ ...formData, productCode: e.target.value })}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
              placeholder={l10n('product.form.productCodePlaceholder')}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{l10n('product.form.productName')}</AxLabel>
            <AxInput
              type="text"
              value={formData.productName || ''}
              onChange={(e) => onFormDataChange({ ...formData, productName: e.target.value })}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
              placeholder={l10n('product.form.productNamePlaceholder')}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{l10n('product.form.description')}</AxLabel>
            <textarea
              value={formData.description || ''}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              disabled={submitting}
              placeholder={l10n('product.form.descriptionPlaceholder')}
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-normal)',
                lineHeight: 'var(--line-height-normal)',
                padding: 'var(--spacing-sm) calc(var(--spacing-sm) + 6px)',
                border: '2px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color var(--transition-base), box-shadow var(--transition-base)',
                width: '100%',
                minHeight: '100px',
                resize: 'vertical',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-background-default)',
                marginTop: 'var(--spacing-xs)',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-border-focus)';
                e.target.style.boxShadow = 'var(--shadow-focus-sm)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border-default)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{l10n('product.form.unitPrice')}</AxLabel>
            <AxInput
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice !== undefined && formData.unitPrice !== null ? formData.unitPrice : ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                onFormDataChange({ ...formData, unitPrice: value });
              }}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
              placeholder={l10n('product.form.unitPricePlaceholder')}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{l10n('product.form.cost')}</AxLabel>
            <AxInput
              type="number"
              step="0.01"
              min="0"
              value={formData.cost !== undefined && formData.cost !== null ? formData.cost : ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                onFormDataChange({ ...formData, cost: value });
              }}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
              placeholder={l10n('product.form.costPlaceholder')}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{l10n('product.form.unitOfMeasure')}</AxLabel>
            <AxInput
              type="text"
              value={formData.unitOfMeasure || ''}
              onChange={(e) => onFormDataChange({ ...formData, unitOfMeasure: e.target.value })}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
              placeholder={l10n('product.form.unitOfMeasurePlaceholder')}
            />
          </AxFormGroup>
          <AxFormGroup>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <AxCheckbox
                checked={formData.active !== undefined ? formData.active : true}
                onChange={(checked) => onFormDataChange({ ...formData, active: checked })}
                disabled={submitting}
              />
              <AxLabel style={{ margin: 0, cursor: 'pointer' }} onClick={() => {
                if (!submitting) {
                  onFormDataChange({ ...formData, active: !(formData.active !== undefined ? formData.active : true) });
                }
              }}>
                {l10n('product.form.active')}
              </AxLabel>
            </div>
          </AxFormGroup>
        </div>
      </AxDialog>

      {/* Delete Confirmation Dialog */}
      <AxDialog
        open={deleteDialogOpen}
        onClose={onDeleteCancel}
        title={l10n('product.dialog.deleteTitle')}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={onDeleteCancel}
              disabled={submitting}
            >
              {l10n('common.cancel')}
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={onDeleteConfirm}
              disabled={submitting}
            >
              {submitting ? l10n('common.deleting') : l10n('common.delete')}
            </AxButton>
          </div>
        }
      >
        <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
          {l10n('product.dialog.deleteConfirm')}
        </AxParagraph>
        <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {l10n('product.dialog.deleteWarning')}
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

