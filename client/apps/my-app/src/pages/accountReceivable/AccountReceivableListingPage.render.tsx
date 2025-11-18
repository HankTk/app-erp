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
import { debugProps } from '../../utils/emotionCache';
import { Order } from '../../api/orderApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './AccountReceivableListingPage.styles';

const COMPONENT_NAME = 'AccountReceivableListingPage';

interface AccountReceivableListingPageRenderProps {
  invoices: Order[];
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  filteredInvoices: Order[];
  onViewInvoice?: (orderId: string) => void;
  onNavigateBack?: () => void;
  onStatusFilterChange: (value: string | null) => void;
  getCustomerName: (customerId?: string) => string;
  formatDate: (dateString?: string) => string;
  calculateOutstandingAmount: (invoice: Order) => number;
  getStatusColor: (status?: string) => string;
  getStatusBackgroundColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
}

export function AccountReceivableListingPageRender(props: AccountReceivableListingPageRenderProps) {
  const {
    invoices,
    loading,
    error,
    statusFilter,
    filteredInvoices,
    onViewInvoice,
    onNavigateBack,
    onStatusFilterChange,
    getCustomerName,
    formatDate,
    calculateOutstandingAmount,
    getStatusColor,
    getStatusBackgroundColor,
    getStatusLabel,
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
                  Account Receivable
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  View and manage invoices
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>Loading invoices...</AxParagraph>
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
                  Account Receivable
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  View and manage invoices
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
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
                Account Receivable
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                View and manage invoices
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                options={[
                  { value: null, label: 'All Statuses' },
                  { value: 'INVOICED', label: 'Invoiced' },
                  { value: 'PAID', label: 'Paid' },
                ]}
                value={statusFilter}
                onChange={(value) => onStatusFilterChange(value)}
                placeholder="Filter by status"
              />
            </AxFormGroup>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {filteredInvoices.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>No invoices found</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth stickyHeader>
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

