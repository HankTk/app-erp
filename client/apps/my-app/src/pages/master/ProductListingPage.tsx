import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchProducts, createProduct, updateProduct, deleteProduct, Product } from '../../api/productApi';
import { ProductListingPageRender } from './ProductListingPage.render';

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

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDialogClose = () => {
    setDialogMode(null);
    setFormData({});
    setSelectedProduct(null);
  };

  const handleFormDataChange = (data: Partial<Product>) => {
    setFormData(data);
  };

  return (
    <ProductListingPageRender
      products={products}
      loading={loading}
      error={error}
      dialogMode={dialogMode}
      deleteDialogOpen={deleteDialogOpen}
      selectedProduct={selectedProduct}
      formData={formData}
      submitting={submitting}
      onNavigateBack={onNavigateBack}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDeleteClick={handleDeleteClick}
      onDeleteConfirm={handleDelete}
      onDeleteCancel={handleDeleteCancel}
      onSave={handleSave}
      onDialogClose={handleDialogClose}
      onFormDataChange={handleFormDataChange}
      onRetry={() => window.location.reload()}
    />
  );
}

