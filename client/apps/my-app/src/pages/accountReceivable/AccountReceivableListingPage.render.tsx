import {
  AxTable,
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxListbox,
  ColumnDefinition,
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

const createColumns = (): ColumnDefinition<Order, ListingRenderContext>[] => [
  { 
    key: 'accountsReceivable.invoiceNumber',
    header: 'Invoice Number',
    align: undefined,
    render: (invoice: Order) => invoice.invoiceNumber || 'N/A'
  },
  { 
    key: 'accountsReceivable.orderNumber',
    header: 'Order Number',
    align: undefined,
    render: (invoice: Order) => invoice.orderNumber || invoice.id?.substring(0, 8) || 'N/A'
  },
  { 
    key: 'accountsReceivable.customer',
    header: 'Customer',
    align: undefined,
    render: (invoice: Order, context) => context?.getCustomerName(invoice.customerId) || 'N/A'
  },
  { 
    key: 'accountsReceivable.invoiceDate',
    header: 'Invoice Date',
    align: undefined,
    render: (invoice: Order, context) => context?.formatDate(invoice.invoiceDate) || 'N/A'
  },
  { 
    key: 'accountsReceivable.dueDate',
    header: 'Due Date',
    align: undefined,
    render: (invoice: Order, context) => context?.formatDate(invoice.invoiceDate) || 'N/A'
  },
  { 
    key: 'accountsReceivable.invoiceAmount',
    header: 'Invoice Amount',
    align: 'right',
    render: (invoice: Order) => `$${(invoice.total?.toFixed(2) || '0.00')}`
  },
  { 
    key: 'accountsReceivable.paidAmount',
    header: 'Paid Amount',
    align: 'right',
    render: (invoice: Order) => `$${((invoice.jsonData?.paymentAmount || 0).toFixed(2))}`
  },
  { 
    key: 'accountsReceivable.outstanding',
    header: 'Outstanding',
    align: 'right',
    render: (invoice: Order, context) => {
      const outstanding = context?.calculateOutstandingAmount(invoice) || 0;
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
    header: 'Status',
    align: undefined,
    render: (invoice: Order, context) => (
      <span 
        style={{ 
          color: context?.getStatusColor(invoice.status) || 'var(--color-text-primary)', 
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: context?.getStatusBackgroundColor(invoice.status) || 'transparent',
          display: 'inline-block',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {context?.getStatusLabel(invoice.status) || invoice.status || 'N/A'}
      </span>
    )
  },
  { 
    key: 'accountsReceivable.actions',
    header: 'Actions',
    align: 'center',
    render: (invoice: Order, context) => {
      if (context?.onViewInvoice && invoice.id) {
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

  const columns = createColumns();
  const tableContext: ListingRenderContext = {
    getCustomerName,
    formatDate,
    calculateOutstandingAmount,
    getStatusColor,
    getStatusBackgroundColor,
    getStatusLabel,
    onViewInvoice,
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
                  Account Receivable
                </AxHeading3>
                <AxParagraph color="secondary">
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
                <AxParagraph color="secondary">
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
            <AxParagraph color="error">Error: {error}</AxParagraph>
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
            <div style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'INVOICED', label: 'Invoiced' },
                  { value: 'PAID', label: 'Paid' },
                ]}
                value={statusFilter || ''}
                onChange={(value: string | string[]) => onStatusFilterChange(Array.isArray(value) ? value[0] || null : value || null)}
                placeholder="Filter by status"
              />
            </div>
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
            <AxTable
              fullWidth
              stickyHeader
              data={filteredInvoices}
              columns={columns}
              context={tableContext}
              getRowKey={(invoice) => invoice.id || ''}
            />
          )}
        </div>
      </TableCard>
    </PageContainer>
  );
}

