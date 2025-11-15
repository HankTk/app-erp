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
  AxDialog,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxCheckbox,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchProducts, createProduct, updateProduct, deleteProduct, Product } from '../../api/productApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'ProductListingPage';

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

type DialogMode = 'add' | 'edit' | null;

interface ProductListingPageProps {
  onNavigateBack?: () => void;
}

export function ProductListingPage({ onNavigateBack }: ProductListingPageProps = {}) {
  const { l10n } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await fetchProducts();
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdd = () => {
    setFormData({
      active: true,
      unitPrice: 0,
      cost: 0,
    });
    setSelectedProduct(null);
    setDialogMode('add');
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setSelectedProduct(product);
    setDialogMode('edit');
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct?.id) return;

    try {
      setSubmitting(true);
      await deleteProduct(selectedProduct.id);
      await loadProducts();
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      
      if (dialogMode === 'edit' && selectedProduct?.id) {
        await updateProduct(selectedProduct.id, formData);
      } else {
        await createProduct(formData);
      }

      await loadProducts();
      setDialogMode(null);
      setFormData({});
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      alert(err instanceof Error ? err.message : `Failed to ${dialogMode === 'edit' ? 'update' : 'create'} product`);
    } finally {
      setSubmitting(false);
    }
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
              <AxButton variant="primary" onClick={handleAdd}>Add New</AxButton>
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
              <AxButton variant="primary" onClick={handleAdd}>Add New</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={() => window.location.reload()}>
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
            <AxButton variant="primary" onClick={handleAdd}>Add New</AxButton>
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
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Product Code</AxTableHeader>
                  <AxTableHeader>Product Name</AxTableHeader>
                  <AxTableHeader>Description</AxTableHeader>
                  <AxTableHeader align="right">Unit Price</AxTableHeader>
                  <AxTableHeader align="right">Cost</AxTableHeader>
                  <AxTableHeader>Unit of Measure</AxTableHeader>
                  <AxTableHeader align="center">Active</AxTableHeader>
                  <AxTableHeader align="center">Actions</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {products.map((product) => (
                  <AxTableRow key={product.id}>
                    <AxTableCell>{product.productCode || ''}</AxTableCell>
                    <AxTableCell>{product.productName || ''}</AxTableCell>
                    <AxTableCell>{product.description || ''}</AxTableCell>
                    <AxTableCell align="right">
                      {product.unitPrice !== undefined && product.unitPrice !== null 
                        ? `$${product.unitPrice.toFixed(2)}` 
                        : ''}
                    </AxTableCell>
                    <AxTableCell align="right">
                      {product.cost !== undefined && product.cost !== null 
                        ? `$${product.cost.toFixed(2)}` 
                        : '-'}
                    </AxTableCell>
                    <AxTableCell>{product.unitOfMeasure || ''}</AxTableCell>
                    <AxTableCell align="center">
                      <span style={{ 
                        color: product.active ? 'var(--color-success)' : 'var(--color-text-secondary)',
                        fontWeight: 500
                      }}>
                        {product.active ? 'Yes' : 'No'}
                      </span>
                    </AxTableCell>
                    <AxTableCell align="center">
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
                        <AxButton 
                          variant="secondary" 
                          size="small"
                          onClick={() => handleEdit(product)}
                          style={{ minWidth: '80px' }}
                        >
                          Edit
                        </AxButton>
                        <AxButton 
                          variant="danger" 
                          size="small"
                          onClick={() => handleDeleteClick(product)}
                          style={{ minWidth: '80px' }}
                        >
                          Delete
                        </AxButton>
                      </div>
                    </AxTableCell>
                  </AxTableRow>
                ))}
              </AxTableBody>
            </AxTable>
          )}
        </div>
      </TableCard>

      {/* Add/Edit Product Dialog */}
      <AxDialog
        open={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setFormData({});
          setSelectedProduct(null);
        }}
        title={dialogMode === 'add' ? 'Add Product' : 'Edit Product'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDialogMode(null);
                setFormData({});
                setSelectedProduct(null);
              }}
              disabled={submitting}
            >
              Cancel
            </AxButton>
            <AxButton 
              variant="primary" 
              onClick={handleSave}
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
              onChange={(e) => {
                setFormData({ ...formData, productCode: e.target.value });
              }}
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
              onChange={(e) => {
                setFormData({ ...formData, productName: e.target.value });
              }}
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
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
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
                setFormData({ ...formData, unitPrice: value });
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
                setFormData({ ...formData, cost: value });
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
              onChange={(e) => {
                setFormData({ ...formData, unitOfMeasure: e.target.value });
              }}
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
                onChange={(checked) => {
                  setFormData({ ...formData, active: checked });
                }}
                disabled={submitting}
              />
              <AxLabel style={{ margin: 0, cursor: 'pointer' }} onClick={() => {
                if (!submitting) {
                  setFormData({ ...formData, active: !(formData.active !== undefined ? formData.active : true) });
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
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedProduct(null);
              }}
              disabled={submitting}
            >
              Cancel
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={handleDelete}
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

