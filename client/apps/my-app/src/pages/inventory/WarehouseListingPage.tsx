import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, Warehouse } from '../../api/warehouseApi';
import { WarehouseListingPageRender } from './WarehouseListingPage.render';

type DialogMode = 'add' | 'edit' | null;

interface WarehouseListingPageProps {
  onNavigateBack?: () => void;
}

export function WarehouseListingPage({ onNavigateBack }: WarehouseListingPageProps = {}) {
  const { l10n } = useI18n();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<Partial<Warehouse>>({});
  const [submitting, setSubmitting] = useState(false);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const warehousesData = await fetchWarehouses();
      setWarehouses(warehousesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load warehouses');
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleAdd = () => {
    setFormData({
      warehouseCode: '',
      warehouseName: '',
      address: '',
      description: '',
      active: true,
    });
    setDialogMode('add');
  };

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({ ...warehouse });
    setDialogMode('edit');
  };

  const handleDelete = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWarehouse?.id) return;
    try {
      await deleteWarehouse(selectedWarehouse.id);
      await loadWarehouses();
      setDeleteDialogOpen(false);
      setSelectedWarehouse(null);
    } catch (err) {
      console.error('Error deleting warehouse:', err);
      alert('Failed to delete warehouse');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedWarehouse(null);
  };

  const handleSubmit = async () => {
    if (!formData.warehouseCode || !formData.warehouseName) {
      alert('Warehouse code and name are required');
      return;
    }

    try {
      setSubmitting(true);
      if (dialogMode === 'add') {
        await createWarehouse(formData as Warehouse);
      } else if (dialogMode === 'edit' && selectedWarehouse?.id) {
        await updateWarehouse(selectedWarehouse.id, formData as Warehouse);
      }
      await loadWarehouses();
      setDialogMode(null);
      setSelectedWarehouse(null);
      setFormData({});
    } catch (err) {
      console.error('Error saving warehouse:', err);
      alert('Failed to save warehouse');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setDialogMode(null);
    setSelectedWarehouse(null);
    setFormData({});
  };

  const handleFormDataChange = (data: Partial<Warehouse>) => {
    setFormData(data);
  };

  return (
    <WarehouseListingPageRender
      warehouses={warehouses}
      loading={loading}
      error={error}
      dialogMode={dialogMode}
      deleteDialogOpen={deleteDialogOpen}
      selectedWarehouse={selectedWarehouse}
      formData={formData}
      submitting={submitting}
      onNavigateBack={onNavigateBack}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
      onSubmit={handleSubmit}
      onDialogClose={handleDialogClose}
      onFormDataChange={handleFormDataChange}
      onRetry={loadWarehouses}
    />
  );
}

