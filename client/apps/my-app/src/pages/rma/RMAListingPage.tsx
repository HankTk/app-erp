import { useState, useEffect } from 'react';
import { fetchRMAs, deleteRMA, RMA } from '../../api/rmaApi';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { RMAListingPageRender } from './RMAListingPage.render';

interface RMAListingPageProps {
  onNavigateToRMAEntry?: () => void;
  onEditRMA?: (rmaId: string) => void;
  onViewRMA?: (rmaId: string) => void;
  onNavigateBack?: () => void;
  onNavigateToShopFloorControl?: (rmaId: string) => void;
}

export function RMAListingPage({ onNavigateToRMAEntry, onEditRMA, onViewRMA, onNavigateBack, onNavigateToShopFloorControl }: RMAListingPageProps = {} as RMAListingPageProps) {
  const [rmas, setRmas] = useState<RMA[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRMA, setSelectedRMA] = useState<RMA | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const loadRMAs = async () => {
    try {
      setLoading(true);
      setError(null);
      const rmasData = await fetchRMAs();
      setRmas(rmasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RMAs');
      console.error('Error fetching RMAs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersData = await fetchCustomers();
      setCustomers(customersData);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  useEffect(() => {
    loadRMAs();
    loadCustomers();
  }, []);

  const filteredRMAs = statusFilter
    ? rmas.filter(rma => rma.status === statusFilter)
    : rmas;

  const getCustomerName = (rma: RMA) => {
    if (rma.customerName) return rma.customerName;
    if (!rma.customerId) return 'N/A';
    const customer = customers.find(c => c.id === rma.customerId);
    return customer ? (customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email) : rma.customerId;
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

  const handleView = (rma: RMA) => {
    if (onViewRMA && rma.id) {
      onViewRMA(rma.id);
    }
  };

  const handleEdit = (rma: RMA) => {
    if (onEditRMA && rma.id) {
      onEditRMA(rma.id);
    }
  };

  const handleDeleteClick = (rma: RMA) => {
    setSelectedRMA(rma);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRMA?.id) return;

    try {
      setSubmitting(true);
      await deleteRMA(selectedRMA.id);
      await loadRMAs();
      setDeleteDialogOpen(false);
      setSelectedRMA(null);
    } catch (err) {
      console.error('Error deleting RMA:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete RMA');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedRMA(null);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return '#6B7280';
      case 'PENDING_APPROVAL':
        return '#F59E0B';
      case 'APPROVED':
        return '#3B82F6';
      case 'RECEIVED':
        return '#10B981';
      case 'PROCESSED':
        return '#059669';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusBackgroundColor = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return '#F3F4F6';
      case 'PENDING_APPROVAL':
        return '#FEF3C7';
      case 'APPROVED':
        return '#DBEAFE';
      case 'RECEIVED':
        return '#D1FAE5';
      case 'PROCESSED':
        return '#D1FAE5';
      case 'CANCELLED':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Draft';
      case 'PENDING_APPROVAL':
        return 'Pending Approval';
      case 'APPROVED':
        return 'Approved';
      case 'RECEIVED':
        return 'Received';
      case 'PROCESSED':
        return 'Processed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status || 'N/A';
    }
  };

  return (
    <RMAListingPageRender
      rmas={rmas}
      loading={loading}
      error={error}
      statusFilter={statusFilter}
      filteredRMAs={filteredRMAs}
      deleteDialogOpen={deleteDialogOpen}
      submitting={submitting}
      selectedRMA={selectedRMA}
      onNavigateToRMAEntry={onNavigateToRMAEntry}
      onEditRMA={onEditRMA}
      onViewRMA={onViewRMA}
      onNavigateBack={onNavigateBack}
      onNavigateToShopFloorControl={onNavigateToShopFloorControl}
      onStatusFilterChange={setStatusFilter}
      onDeleteClick={handleDeleteClick}
      onDeleteConfirm={handleDelete}
      onDeleteCancel={handleDeleteCancel}
      getCustomerName={getCustomerName}
      formatDate={formatDate}
      getStatusColor={getStatusColor}
      getStatusBackgroundColor={getStatusBackgroundColor}
      getStatusLabel={getStatusLabel}
    />
  );
}

