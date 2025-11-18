import { useState, useEffect } from 'react';
import { fetchPurchaseOrders, deletePurchaseOrder, PurchaseOrder } from '../../api/purchaseOrderApi';
import { fetchVendors, Vendor } from '../../api/vendorApi';
import { fetchAddresses, Address } from '../../api/addressApi';
import { useI18n } from '../../i18n/I18nProvider';
import { PurchaseOrderListingPageRender } from './PurchaseOrderListingPage.render';

interface PurchaseOrderListingPageProps {
  onNavigateToPOEntry?: () => void;
  onEditPO?: (poId: string) => void;
  onViewPO?: (poId: string) => void;
  onNavigateBack?: () => void;
}

export function PurchaseOrderListingPage({ onNavigateToPOEntry, onEditPO, onViewPO, onNavigateBack }: PurchaseOrderListingPageProps = {} as PurchaseOrderListingPageProps) {
  const { l10n } = useI18n();
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Vendor[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const loadPOs = async () => {
    try {
      setLoading(true);
      setError(null);
      const posData = await fetchPurchaseOrders();
      setPOs(posData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load purchase orders';
      setError(errorMessage);
      console.error('Error fetching purchase orders:', err);
      // If it's a 404, suggest restarting the server
      if (errorMessage.includes('404')) {
        console.warn('404 error detected. Please make sure the backend server is running and has been restarted after adding Purchase Order endpoints.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const suppliersData = await fetchVendors();
      setSuppliers(suppliersData);
    } catch (err) {
      console.error('Error loading suppliers:', err);
    }
  };

  const loadAddresses = async () => {
    try {
      const addressesData = await fetchAddresses();
      setAddresses(addressesData);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  };

  useEffect(() => {
    loadPOs();
    loadSuppliers();
    loadAddresses();
  }, []);

  const filteredPOs = statusFilter
    ? pos.filter(po => po.status === statusFilter)
    : pos;

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return 'N/A';
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? (supplier.companyName || `${supplier.lastName} ${supplier.firstName}` || supplier.email) : supplierId;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleView = (po: PurchaseOrder) => {
    if (onViewPO && po.id) {
      onViewPO(po.id);
    }
  };

  const handleEdit = (po: PurchaseOrder) => {
    if (onEditPO && po.id) {
      onEditPO(po.id);
    }
  };

  const handleDeleteClick = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPO?.id) return;

    try {
      setSubmitting(true);
      await deletePurchaseOrder(selectedPO.id);
      await loadPOs();
      setDeleteDialogOpen(false);
      setSelectedPO(null);
    } catch (err) {
      console.error('Error deleting purchase order:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPO(null);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return '#6B7280';
      case 'PENDING_APPROVAL':
        return '#F59E0B';
      case 'APPROVED':
        return '#10B981';
      case 'RECEIVED':
        return '#8B5CF6';
      case 'INVOICED':
        return '#EC4899';
      case 'PAID':
        return '#059669';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return l10n('purchaseOrder.status.draft');
      case 'PENDING_APPROVAL':
        return l10n('purchaseOrder.status.pendingApproval');
      case 'APPROVED':
        return l10n('purchaseOrder.status.approved');
      case 'RECEIVED':
        return l10n('purchaseOrder.status.received');
      case 'INVOICED':
        return l10n('purchaseOrder.status.invoiced');
      case 'PAID':
        return l10n('purchaseOrder.status.paid');
      case 'CANCELLED':
        return l10n('purchaseOrder.status.cancelled');
      default:
        return status || 'N/A';
    }
  };

  const statusOptions = [
    { value: '', label: l10n('purchaseOrder.filter.all') },
    { value: 'DRAFT', label: l10n('purchaseOrder.status.draft') },
    { value: 'PENDING_APPROVAL', label: l10n('purchaseOrder.status.pendingApproval') },
    { value: 'APPROVED', label: l10n('purchaseOrder.status.approved') },
    { value: 'RECEIVED', label: l10n('purchaseOrder.status.received') },
    { value: 'INVOICED', label: l10n('purchaseOrder.status.invoiced') },
    { value: 'PAID', label: l10n('purchaseOrder.status.paid') },
    { value: 'CANCELLED', label: l10n('purchaseOrder.status.cancelled') },
  ];

  return (
    <PurchaseOrderListingPageRender
      pos={pos}
      loading={loading}
      error={error}
      statusFilter={statusFilter}
      filteredPOs={filteredPOs}
      deleteDialogOpen={deleteDialogOpen}
      submitting={submitting}
      selectedPO={selectedPO}
      statusOptions={statusOptions}
      onNavigateToPOEntry={onNavigateToPOEntry}
      onEditPO={onEditPO}
      onViewPO={onViewPO}
      onNavigateBack={onNavigateBack}
      onStatusFilterChange={setStatusFilter}
      onDeleteClick={handleDeleteClick}
      onDeleteConfirm={handleDelete}
      onDeleteCancel={handleDeleteCancel}
      getSupplierName={getSupplierName}
      formatDate={formatDate}
      getStatusColor={getStatusColor}
      getStatusLabel={getStatusLabel}
    />
  );
}

