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
import { useI18n } from '../../i18n/I18nProvider';
import { debugProps } from '../../utils/emotionCache';
import { PurchaseOrder } from '../../api/purchaseOrderApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './AccountPayableListingPage.styles';

const COMPONENT_NAME = 'AccountPayableListingPage';

interface AccountPayableListingPageRenderProps {
  invoices: PurchaseOrder[];
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  filteredInvoices: PurchaseOrder[];
  onViewInvoice?: (prId: string) => void;
  onNavigateBack?: () => void;
  onStatusFilterChange: (value: string | null) => void;
  getSupplierName: (supplierId?: string) => string;
  formatDate: (dateString?: string) => string;
  calculateOutstandingAmount: (invoice: PurchaseOrder) => number;
}

export function AccountPayableListingPageRender(props: AccountPayableListingPageRenderProps) {
  const {
    invoices,
    loading,
    error,
    statusFilter,
    filteredInvoices,
    onViewInvoice,
    onNavigateBack,
    onStatusFilterChange,
    getSupplierName,
    formatDate,
    calculateOutstandingAmount,
  } = props;
  
  const { l10n } = useI18n();

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
                onChange={(value: string | null) => onStatusFilterChange(value || null)}
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

