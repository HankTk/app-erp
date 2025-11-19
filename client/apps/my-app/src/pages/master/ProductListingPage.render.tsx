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
import { debugProps } from '../../utils/emotionCache';
import { Product } from '../../api/productApi';
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
};

const LISTING_TABLE_COLUMNS = [
  { 
    key: 'product.productCode',
    label: 'Product Code',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (product: Product) => product.productCode || ''
  },
  { 
    key: 'product.productName',
    label: 'Product Name',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (product: Product) => product.productName || ''
  },
  { 
    key: 'product.description',
    label: 'Description',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (product: Product) => product.description || ''
  },
  { 
    key: 'product.unitPrice',
    label: 'Unit Price',
    align: 'right' as const,
    render: (product: Product) => product.unitPrice !== undefined && product.unitPrice !== null 
      ? `$${product.unitPrice.toFixed(2)}` 
      : ''
  },
  { 
    key: 'product.cost',
    label: 'Cost',
    align: 'right' as const,
    render: (product: Product) => product.cost !== undefined && product.cost !== null 
      ? `$${product.cost.toFixed(2)}` 
      : '-'
  },
  { 
    key: 'product.unitOfMeasure',
    label: 'Unit of Measure',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (product: Product) => product.unitOfMeasure || ''
  },
  { 
    key: 'product.active',
    label: 'Active',
    align: 'center' as const,
    render: (product: Product) => (
      <span style={{ 
        color: product.active ? 'var(--color-success)' : 'var(--color-text-secondary)',
        fontWeight: 500
      }}>
        {product.active ? 'Yes' : 'No'}
      </span>
    )
  },
  { 
    key: 'product.actions',
    label: 'Actions',
    align: 'center' as const,
    render: (product: Product, context: ListingRenderContext) => (
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
        <AxButton 
          variant="secondary" 
          size="small"
          onClick={() => context.onEdit(product)}
          style={{ minWidth: '80px' }}
        >
          Edit
        </AxButton>
        <AxButton 
          variant="danger" 
          size="small"
          onClick={() => context.onDeleteClick(product)}
          style={{ minWidth: '80px' }}
        >
          Delete
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>Loading products...</AxParagraph>
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={onRetry}>
              Retry
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
              <AxParagraph>No products found</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth stickyHeader>
              <AxTableHead>
                <AxTableRow>
                  {LISTING_TABLE_COLUMNS.map((column) => (
                    <AxTableHeader key={column.key} align={column.align}>
                      {column.label}
                    </AxTableHeader>
                  ))}
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {products.map((product) => {
                  const context: ListingRenderContext = {
                    onEdit,
                    onDeleteClick,
                  };
                  return (
                    <AxTableRow key={product.id}>
                      {LISTING_TABLE_COLUMNS.map((column) => (
                        <AxTableCell key={column.key} align={column.align}>
                          {column.render(product, context)}
                        </AxTableCell>
                      ))}
                    </AxTableRow>
                  );
                })}
              </AxTableBody>
            </AxTable>
          )}
        </div>
      </TableCard>

      {/* Add/Edit Product Dialog */}
      <AxDialog
        open={dialogMode !== null}
        onClose={onDialogClose}
        title={dialogMode === 'add' ? 'Add Product' : 'Edit Product'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={onDialogClose}
              disabled={submitting}
            >
              Cancel
            </AxButton>
            <AxButton 
              variant="primary" 
              onClick={onSave}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </AxButton>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <AxFormGroup>
            <AxLabel>Product Code</AxLabel>
            <AxInput
              type="text"
              value={formData.productCode || ''}
              onChange={(e) => onFormDataChange({ ...formData, productCode: e.target.value })}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
              placeholder="e.g., PROD-001"
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>Product Name</AxLabel>
            <AxInput
              type="text"
              value={formData.productName || ''}
              onChange={(e) => onFormDataChange({ ...formData, productName: e.target.value })}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
              placeholder="Enter product name"
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>Description</AxLabel>
            <textarea
              value={formData.description || ''}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              disabled={submitting}
              placeholder="Enter product description"
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
            <AxLabel>Unit Price</AxLabel>
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
              placeholder="0.00"
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>Cost (for General Ledger)</AxLabel>
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
              placeholder="0.00"
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>Unit of Measure</AxLabel>
            <AxInput
              type="text"
              value={formData.unitOfMeasure || ''}
              onChange={(e) => onFormDataChange({ ...formData, unitOfMeasure: e.target.value })}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
              placeholder="e.g., each, box, kg, lb"
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
                Active (product is available for orders)
              </AxLabel>
            </div>
          </AxFormGroup>
        </div>
      </AxDialog>

      {/* Delete Confirmation Dialog */}
      <AxDialog
        open={deleteDialogOpen}
        onClose={onDeleteCancel}
        title="Delete Product"
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={onDeleteCancel}
              disabled={submitting}
            >
              Cancel
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={onDeleteConfirm}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </AxButton>
          </div>
        }
      >
        <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
          Are you sure you want to delete this product?
        </AxParagraph>
        <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          This action cannot be undone. Products that are used in existing orders will still be referenced, but new orders cannot use this product.
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

