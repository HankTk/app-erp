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

type ListingRenderContext = {
  getCustomerName: (customerId?: string) => string;
  formatDate: (dateString?: string) => string;
  calculateOutstandingAmount: (invoice: Order) => number;
  getStatusColor: (status?: string) => string;
  getStatusBackgroundColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
  onViewInvoice?: (orderId: string) => void;
};

const LISTING_TABLE_COLUMNS = [
  { 
    key: 'accountsReceivable.invoiceNumber',
    label: 'Invoice Number',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: Order, context: ListingRenderContext) => invoice.invoiceNumber || 'N/A'
  },
  { 
    key: 'accountsReceivable.orderNumber',
    label: 'Order Number',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: Order, context: ListingRenderContext) => invoice.orderNumber || invoice.id?.substring(0, 8) || 'N/A'
  },
  { 
    key: 'accountsReceivable.customer',
    label: 'Customer',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: Order, context: ListingRenderContext) => context.getCustomerName(invoice.customerId)
  },
  { 
    key: 'accountsReceivable.invoiceDate',
    label: 'Invoice Date',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: Order, context: ListingRenderContext) => context.formatDate(invoice.invoiceDate)
  },
  { 
    key: 'accountsReceivable.dueDate',
    label: 'Due Date',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: Order, context: ListingRenderContext) => context.formatDate(invoice.invoiceDate)
  },
  { 
    key: 'accountsReceivable.invoiceAmount',
    label: 'Invoice Amount',
    align: 'right' as const,
    render: (invoice: Order) => `$${(invoice.total?.toFixed(2) || '0.00')}`
  },
  { 
    key: 'accountsReceivable.paidAmount',
    label: 'Paid Amount',
    align: 'right' as const,
    render: (invoice: Order) => `$${((invoice.jsonData?.paymentAmount || 0).toFixed(2))}`
  },
  { 
    key: 'accountsReceivable.outstanding',
    label: 'Outstanding',
    align: 'right' as const,
    render: (invoice: Order, context: ListingRenderContext) => {
      const outstanding = context.calculateOutstandingAmount(invoice);
      return (
        <span style={{ 
          color: outstanding > 0 ? 'var(--color-warning)' : 'var(--color-success)',
          fontWeight: outstanding > 0 ? 'var(--font-weight-bold)' : 'normal'
        }}>
          ${outstanding.toFixed(2)}
        </span>
      );
    }
  },
  { 
    key: 'accountsReceivable.status',
    label: 'Status',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: Order, context: ListingRenderContext) => (
      <span 
        style={{ 
          color: context.getStatusColor(invoice.status), 
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: context.getStatusBackgroundColor(invoice.status),
          display: 'inline-block',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {context.getStatusLabel(invoice.status)}
      </span>
    )
  },
  { 
    key: 'accountsReceivable.actions',
    label: 'Actions',
    align: 'center' as const,
    render: (invoice: Order, context: ListingRenderContext) => {
      if (context.onViewInvoice && invoice.id) {
        return (
          <AxButton 
            variant="secondary" 
            size="small"
            onClick={() => context.onViewInvoice!(invoice.id!)}
            style={{ minWidth: '80px' }}
          >
            View
          </AxButton>
        );
      }
      return null;
    }
  },
];

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
                  {LISTING_TABLE_COLUMNS.map((column) => (
                    <AxTableHeader key={column.key} align={column.align}>
                      {column.label}
                    </AxTableHeader>
                  ))}
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {filteredInvoices.map((invoice) => {
                  const context: ListingRenderContext = {
                    getCustomerName,
                    formatDate,
                    calculateOutstandingAmount,
                    getStatusColor,
                    getStatusBackgroundColor,
                    getStatusLabel,
                    onViewInvoice,
                  };
                  return (
                    <AxTableRow key={invoice.id}>
                      {LISTING_TABLE_COLUMNS.map((column) => (
                        <AxTableCell key={column.key} align={column.align}>
                          {column.render(invoice, context)}
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
    </PageContainer>
  );
}

