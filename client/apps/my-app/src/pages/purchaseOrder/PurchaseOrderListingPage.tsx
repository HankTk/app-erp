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
  AxFormGroup,
  AxListbox,
} from '@ui/components';
import { fetchPurchaseOrders, deletePurchaseOrder, PurchaseOrder } from '../../api/purchaseOrderApi';
import { fetchVendors, Vendor } from '../../api/vendorApi';
import { fetchAddresses, Address } from '../../api/addressApi';
import styled from 'styled-components';
import { useI18n } from '../../i18n/I18nProvider';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  width: 100%;
  padding: var(--spacing-lg);
  box-sizing: border-box;
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
  max-height: calc(100vh - 280px);
  overflow: hidden;
`;

interface PurchaseOrderListingPageProps {
  onNavigateToPOEntry?: () => void;
  onEditPO?: (poId: string) => void;
  onViewPO?: (poId: string) => void;
  onNavigateBack?: () => void;
}

export function PurchaseOrderListingPage({ onNavigateToPOEntry, onEditPO, onViewPO, onNavigateBack }: PurchaseOrderListingPageProps = {} as PurchaseOrderListingPageProps) {
  const { t } = useI18n();
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
        return t('purchaseOrder.status.draft');
      case 'PENDING_APPROVAL':
        return t('purchaseOrder.status.pendingApproval');
      case 'APPROVED':
        return t('purchaseOrder.status.approved');
      case 'RECEIVED':
        return t('purchaseOrder.status.received');
      case 'INVOICED':
        return t('purchaseOrder.status.invoiced');
      case 'PAID':
        return t('purchaseOrder.status.paid');
      case 'CANCELLED':
        return t('purchaseOrder.status.cancelled');
      default:
        return status || 'N/A';
    }
  };

  const statusOptions = [
    { value: '', label: t('purchaseOrder.filter.all') },
    { value: 'DRAFT', label: t('purchaseOrder.status.draft') },
    { value: 'PENDING_APPROVAL', label: t('purchaseOrder.status.pendingApproval') },
    { value: 'APPROVED', label: t('purchaseOrder.status.approved') },
    { value: 'RECEIVED', label: t('purchaseOrder.status.received') },
    { value: 'INVOICED', label: t('purchaseOrder.status.invoiced') },
    { value: 'PAID', label: t('purchaseOrder.status.paid') },
    { value: 'CANCELLED', label: t('purchaseOrder.status.cancelled') },
  ];

  if (loading) {
    return (
      <PageContainer>
        <HeaderCard padding="large">
          <HeaderSection>
            <HeaderLeft>
              {onNavigateBack && (
                <AxButton 
                  variant="secondary" 
                  onClick={onNavigateBack}
                  style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                >
                  {t('purchaseOrder.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {t('module.purchaseOrder')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {t('purchaseOrder.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{t('purchaseOrder.loading')}</AxParagraph>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <HeaderCard padding="large">
          <HeaderSection>
            <HeaderLeft>
              {onNavigateBack && (
                <AxButton 
                  variant="secondary" 
                  onClick={onNavigateBack}
                  style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                >
                  {t('purchaseOrder.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {t('module.purchaseOrder')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {t('purchaseOrder.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
            {error.includes('404') && (
              <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
                {t('purchaseOrder.error.serverRestart')}
              </AxParagraph>
            )}
            <AxButton variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </AxButton>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderCard padding="large">
        <HeaderSection>
          <HeaderLeft>
            {onNavigateBack && (
              <AxButton 
                variant="secondary" 
                onClick={onNavigateBack}
                style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              >
                {t('purchaseOrder.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {t('module.purchaseOrder')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {t('purchaseOrder.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight>
            <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                value={statusFilter}
                onChange={(value: string | null) => setStatusFilter(value)}
                options={statusOptions}
                placeholder={t('purchaseOrder.filter.placeholder')}
              />
            </AxFormGroup>
            {onNavigateToPOEntry && (
              <AxButton variant="primary" onClick={onNavigateToPOEntry}>
                {t('purchaseOrder.createOrder')}
              </AxButton>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large">
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {filteredPOs.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>{t('purchaseOrder.noData')}</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>{t('purchaseOrder.orderNumber')}</AxTableHeader>
                  <AxTableHeader>{t('purchaseOrder.supplier')}</AxTableHeader>
                  <AxTableHeader>{t('purchaseOrder.status')}</AxTableHeader>
                  <AxTableHeader>{t('purchaseOrder.orderDate')}</AxTableHeader>
                  <AxTableHeader>{t('purchaseOrder.expectedDeliveryDate')}</AxTableHeader>
                  <AxTableHeader align="right">{t('purchaseOrder.total')}</AxTableHeader>
                  <AxTableHeader align="center">{t('purchaseOrder.actions')}</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {filteredPOs.map((po) => (
                  <AxTableRow key={po.id}>
                    <AxTableCell>{po.orderNumber || po.id?.substring(0, 8) || 'N/A'}</AxTableCell>
                    <AxTableCell>{getSupplierName(po.supplierId)}</AxTableCell>
                    <AxTableCell>
                      <span 
                        style={{ 
                          color: getStatusColor(po.status), 
                          fontWeight: 600,
                          padding: 'var(--spacing-xs) var(--spacing-sm)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: getStatusColor(po.status) + '20',
                          fontSize: 'var(--font-size-sm)',
                        }}
                      >
                        {getStatusLabel(po.status)}
                      </span>
                    </AxTableCell>
                    <AxTableCell>{formatDate(po.orderDate)}</AxTableCell>
                    <AxTableCell>{formatDate(po.expectedDeliveryDate)}</AxTableCell>
                    <AxTableCell align="right">
                      ${po.total?.toFixed(2) || '0.00'}
                    </AxTableCell>
                    <AxTableCell align="center">
                      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                        {onViewPO && (
                          <AxButton variant="secondary" size="small" onClick={() => handleView(po)}>
                            {t('purchaseOrder.view')}
                          </AxButton>
                        )}
                        {onEditPO && (
                          <AxButton variant="secondary" size="small" onClick={() => handleEdit(po)}>
                            {t('purchaseOrder.edit')}
                          </AxButton>
                        )}
                        <AxButton variant="danger" size="small" onClick={() => handleDeleteClick(po)}>
                          {t('purchaseOrder.delete')}
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

      <AxDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedPO(null);
        }}
        title={t('purchaseOrder.deleteConfirm')}
      >
        <AxParagraph>{t('purchaseOrder.deleteMessage')}</AxParagraph>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)' }}>
          <AxButton
            variant="secondary"
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedPO(null);
            }}
          >
            {t('purchaseOrder.cancel')}
          </AxButton>
          <AxButton variant="danger" onClick={handleDelete} disabled={submitting}>
            {submitting ? t('purchaseOrder.deleting') : t('purchaseOrder.confirm')}
          </AxButton>
        </div>
      </AxDialog>
    </PageContainer>
  );
}

