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
  AxFormGroup,
  AxListbox,
} from '@ui/components';
import { fetchPurchaseOrders, PurchaseOrder } from '../../api/purchaseOrderApi';
import { fetchVendors, Vendor } from '../../api/vendorApi';
import styled from '@emotion/styled';
import { useI18n } from '../../i18n/I18nProvider';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'AccountPayableListingPage';

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

interface AccountPayableListingPageProps {
  onViewInvoice?: (prId: string) => void;
  onNavigateBack?: () => void;
}

export function AccountPayableListingPage({ onViewInvoice, onNavigateBack }: AccountPayableListingPageProps = {} as AccountPayableListingPageProps) {
  const { l10n } = useI18n();
  const [invoices, setInvoices] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const allPOs = await fetchPurchaseOrders();
      // Filter POs that have been invoiced (INVOICED or PAID status)
      const invoicedPOs = allPOs.filter(po => 
        po.status === 'INVOICED' || po.status === 'PAID'
      );
      setInvoices(invoicedPOs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load invoices';
      setError(errorMessage);
      console.error('Error fetching invoices:', err);
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
      // Don't set error state here as it's not critical for the main functionality
    }
  };

  useEffect(() => {
    loadInvoices();
    loadSuppliers();
  }, []);

  const filteredInvoices = statusFilter
    ? invoices.filter(invoice => invoice.status === statusFilter)
    : invoices;

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

  const calculateOutstandingAmount = (invoice: PurchaseOrder): number => {
    const total = invoice.total || 0;
    const paidAmount = invoice.jsonData?.paymentAmount || 0;
    return Math.max(0, total - paidAmount);
  };

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
                {l10n('accountsPayable.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('module.accountsPayable')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('accountsPayable.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                value={statusFilter || ''}
                onChange={(value: string | null) => setStatusFilter(value || null)}
                options={[
                  { value: '', label: l10n('accountsPayable.filter.all') },
                  { value: 'INVOICED', label: l10n('accountsPayable.status.invoiced') },
                  { value: 'PAID', label: l10n('accountsPayable.status.paid') },
                ]}
                placeholder={l10n('accountsPayable.filter.placeholder')}
              />
            </AxFormGroup>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      {error && (
        <AxCard padding="large">
          <AxParagraph style={{ color: 'var(--color-danger)' }}>{error}</AxParagraph>
        </AxCard>
      )}

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>{l10n('accountsPayable.loading')}</AxParagraph>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>{l10n('accountsPayable.noData')}</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth stickyHeader>
            <AxTableHead>
              <AxTableRow>
                <AxTableHeader>{l10n('accountsPayable.invoiceNumber')}</AxTableHeader>
                <AxTableHeader>{l10n('accountsPayable.orderNumber')}</AxTableHeader>
                <AxTableHeader>{l10n('accountsPayable.supplier')}</AxTableHeader>
                <AxTableHeader>{l10n('accountsPayable.invoiceDate')}</AxTableHeader>
                <AxTableHeader>{l10n('accountsPayable.dueDate')}</AxTableHeader>
                <AxTableHeader align="right">{l10n('accountsPayable.total')}</AxTableHeader>
                <AxTableHeader align="right">{l10n('accountsPayable.paid')}</AxTableHeader>
                <AxTableHeader align="right">{l10n('accountsPayable.outstanding')}</AxTableHeader>
                <AxTableHeader>{l10n('accountsPayable.status')}</AxTableHeader>
                <AxTableHeader>{l10n('accountsPayable.actions')}</AxTableHeader>
              </AxTableRow>
            </AxTableHead>
            <AxTableBody>
              {filteredInvoices.map((invoice) => {
                const outstanding = calculateOutstandingAmount(invoice);
                const paidAmount = invoice.jsonData?.paymentAmount || 0;
                return (
                  <AxTableRow key={invoice.id}>
                    <AxTableCell>{invoice.invoiceNumber || 'N/A'}</AxTableCell>
                    <AxTableCell>{invoice.orderNumber || invoice.id?.substring(0, 8) || 'N/A'}</AxTableCell>
                    <AxTableCell>{getSupplierName(invoice.supplierId)}</AxTableCell>
                    <AxTableCell>{formatDate(invoice.invoiceDate)}</AxTableCell>
                    <AxTableCell>{formatDate(invoice.invoiceDate)}</AxTableCell>
                    <AxTableCell align="right">
                      ${invoice.total?.toFixed(2) || '0.00'}
                    </AxTableCell>
                    <AxTableCell align="right">
                      ${paidAmount.toFixed(2)}
                    </AxTableCell>
                    <AxTableCell align="right" style={{ 
                      color: outstanding > 0 ? 'var(--color-warning)' : 'var(--color-success)',
                      fontWeight: outstanding > 0 ? 'var(--font-weight-bold)' : 'normal'
                    }}>
                      ${outstanding.toFixed(2)}
                    </AxTableCell>
                    <AxTableCell>
                      <span
                        style={{
                          padding: 'var(--spacing-xs) var(--spacing-sm)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: invoice.status === 'PAID' ? '#05966920' : '#EC489920',
                          color: invoice.status === 'PAID' ? '#059669' : '#EC4899',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {invoice.status === 'PAID' ? l10n('accountsPayable.status.paid') : l10n('accountsPayable.status.invoiced')}
                      </span>
                    </AxTableCell>
                    <AxTableCell>
                      {onViewInvoice && invoice.id && (
                        <AxButton variant="secondary" size="small" onClick={() => onViewInvoice(invoice.id!)}>
                          {l10n('accountsPayable.view')}
                        </AxButton>
                      )}
                    </AxTableCell>
                  </AxTableRow>
                );
              })}
            </AxTableBody>
          </AxTable>
          )}
        </div>
      </TableCard>
    </PageContainer>
  );
}

