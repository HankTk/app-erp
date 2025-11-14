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
import { fetchOrders, Order } from '../../api/orderApi';
import { fetchCustomers, Customer } from '../../api/customerApi';
import styled from 'styled-components';

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

interface AccountReceivableListingPageProps {
  onViewInvoice?: (orderId: string) => void;
  onNavigateBack?: () => void;
}

export function AccountReceivableListingPage({ onViewInvoice, onNavigateBack }: AccountReceivableListingPageProps = {} as AccountReceivableListingPageProps) {
  const [invoices, setInvoices] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const allOrders = await fetchOrders();
      // Filter orders that have been invoiced (INVOICED or PAID status)
      const invoicedOrders = allOrders.filter(order => 
        order.status === 'INVOICED' || order.status === 'PAID'
      );
      setInvoices(invoicedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      console.error('Error fetching invoices:', err);
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
    loadInvoices();
    loadCustomers();
  }, []);

  const filteredInvoices = statusFilter
    ? invoices.filter(invoice => invoice.status === statusFilter)
    : invoices;

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'N/A';
    const customer = customers.find(c => c.id === customerId);
    return customer ? (customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email) : customerId;
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

  const calculateOutstandingAmount = (invoice: Order): number => {
    const total = invoice.total || 0;
    const paymentAmount = invoice.jsonData?.paymentAmount || 0;
    return total - paymentAmount;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'INVOICED':
        return '#8B5CF6'; // 紫 - 請求済み
      case 'PAID':
        return '#047857'; // 濃い緑 - 入金済み
      default:
        return '#6B7280'; // デフォルトはグレー
    }
  };

  const getStatusBackgroundColor = (status?: string) => {
    switch (status) {
      case 'INVOICED':
        return '#EDE9FE'; // 紫の背景
      case 'PAID':
        return '#D1FAE5'; // 緑の背景
      default:
        return '#F3F4F6'; // デフォルトはグレーの背景
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'INVOICED':
        return 'Invoiced';
      case 'PAID':
        return 'Paid';
      default:
        return status || 'N/A';
    }
  };

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
                  ← Back
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  Account Receivable
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  View and manage invoices
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>Loading invoices...</AxParagraph>
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
                  ← Back
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  Account Receivable
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  View and manage invoices
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
                ← Back
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                Account Receivable
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                View and manage invoices
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight>
            <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                options={[
                  { value: null, label: 'All Statuses' },
                  { value: 'INVOICED', label: 'Invoiced' },
                  { value: 'PAID', label: 'Paid' },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                placeholder="Filter by status"
              />
            </AxFormGroup>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large">
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {filteredInvoices.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>No invoices found</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Invoice Number</AxTableHeader>
                  <AxTableHeader>Order Number</AxTableHeader>
                  <AxTableHeader>Customer</AxTableHeader>
                  <AxTableHeader>Invoice Date</AxTableHeader>
                  <AxTableHeader>Due Date</AxTableHeader>
                  <AxTableHeader align="right">Invoice Amount</AxTableHeader>
                  <AxTableHeader align="right">Paid Amount</AxTableHeader>
                  <AxTableHeader align="right">Outstanding</AxTableHeader>
                  <AxTableHeader>Status</AxTableHeader>
                  <AxTableHeader align="center">Actions</AxTableHeader>
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
                      <AxTableCell>{getCustomerName(invoice.customerId)}</AxTableCell>
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
                            color: getStatusColor(invoice.status), 
                            fontWeight: 600,
                            padding: '4px 12px',
                            borderRadius: '12px',
                            backgroundColor: getStatusBackgroundColor(invoice.status),
                            display: 'inline-block',
                            fontSize: 'var(--font-size-sm)',
                          }}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </AxTableCell>
                      <AxTableCell align="center">
                        {onViewInvoice && invoice.id && (
                          <AxButton 
                            variant="secondary" 
                            size="small"
                            onClick={() => onViewInvoice(invoice.id!)}
                            style={{ minWidth: '80px' }}
                          >
                            View
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

