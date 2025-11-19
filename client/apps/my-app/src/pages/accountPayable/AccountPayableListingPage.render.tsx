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
  BackButton,
  HeaderTitleContainer,
  HeadingWithMargin,
  ParagraphSecondary,
  ParagraphDanger,
  FormGroupNoMargin,
  TableContainer,
  LoadingContainer,
  OutstandingCell,
  StatusBadge,
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
              <BackButton 
                variant="secondary" 
                onClick={onNavigateBack}
              >
                {l10n('accountsPayable.back')}
              </BackButton>
            )}
            <HeaderTitleContainer>
              <HeadingWithMargin>
                {l10n('module.accountsPayable')}
              </HeadingWithMargin>
              <ParagraphSecondary>
                {l10n('accountsPayable.subtitle')}
              </ParagraphSecondary>
            </HeaderTitleContainer>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <FormGroupNoMargin>
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
            </FormGroupNoMargin>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      {error && (
        <AxCard padding="large">
          <ParagraphDanger>{error}</ParagraphDanger>
        </AxCard>
      )}

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <TableContainer>
          {loading ? (
            <LoadingContainer>
              <AxParagraph>{l10n('accountsPayable.loading')}</AxParagraph>
            </LoadingContainer>
          ) : filteredInvoices.length === 0 ? (
            <LoadingContainer>
              <AxParagraph>{l10n('accountsPayable.noData')}</AxParagraph>
            </LoadingContainer>
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
                    <OutstandingCell align="right" $outstanding={outstanding}>
                      ${outstanding.toFixed(2)}
                    </OutstandingCell>
                    <AxTableCell>
                      <StatusBadge $status={invoice.status as 'PAID' | 'INVOICED'}>
                        {invoice.status === 'PAID' ? l10n('accountsPayable.status.paid') : l10n('accountsPayable.status.invoiced')}
                      </StatusBadge>
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
        </TableContainer>
      </TableCard>
    </PageContainer>
  );
}

