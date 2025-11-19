import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup } from '@ui/components';
import { OrderInvoicingStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';
import { StepContent, InvoiceAmountBox } from './OrderInvoicingStepPage.styles';

export function OrderInvoicingStepPageRender(props: OrderInvoicingStepProps) {
  const { order, invoiceNumber, invoiceDate, onInvoiceNumberChange, onInvoiceDateChange, readOnly = false } = props;
  const { l10n } = useI18n();

  return (
    <StepContent>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('orderEntry.invoicing.title')}</AxHeading3>
      <AxParagraph marginBottom="lg" color="secondary">
        {l10n('orderEntry.invoicing.description')}
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <AxFormGroup>
          <AxLabel>{l10n('orderEntry.invoicing.invoiceNumber')}</AxLabel>
          <AxInput
            type="text"
            value={invoiceNumber}
            onChange={e => onInvoiceNumberChange(e.target.value)}
            disabled={readOnly}
            placeholder={l10n('orderEntry.invoicing.invoiceNumberPlaceholder')}
            style={{ width: '220px' }}
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{l10n('orderEntry.invoicing.invoiceDate')}</AxLabel>
          <AxInput
            type="date"
            value={invoiceDate}
            onChange={e => onInvoiceDateChange(e.target.value)}
            disabled={readOnly}
          />
        </AxFormGroup>

        <InvoiceAmountBox>
          <AxParagraph weight="bold" marginBottom="sm">
            {l10n('orderEntry.invoicing.invoiceAmount')}
          </AxParagraph>
          <AxParagraph size="lg">
            ${order?.total?.toFixed(2) || '0.00'}
          </AxParagraph>
        </InvoiceAmountBox>
      </div>
    </StepContent>
  );
}

