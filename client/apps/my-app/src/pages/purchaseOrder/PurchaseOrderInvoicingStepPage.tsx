import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup } from '@ui/components';
import { PurchaseOrderInvoicingStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';

export function PurchaseOrderInvoicingStepPage(props: PurchaseOrderInvoicingStepProps) {
  const { po, invoiceNumber, invoiceDate, onInvoiceNumberChange, onInvoiceDateChange, readOnly = false } = props;
  const { l10n } = useI18n();

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('purchaseOrderEntry.invoicing.title')}</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {l10n('purchaseOrderEntry.invoicing.description')}
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <AxFormGroup>
          <AxLabel>{l10n('purchaseOrderEntry.invoicing.invoiceNumber')}</AxLabel>
          <AxInput
            type="text"
            value={invoiceNumber}
            onChange={e => onInvoiceNumberChange(e.target.value)}
            disabled={readOnly}
            placeholder={l10n('purchaseOrderEntry.invoicing.invoiceNumberPlaceholder')}
            style={{ width: '220px' }}
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{l10n('purchaseOrderEntry.invoicing.invoiceDate')}</AxLabel>
          <AxInput
            type="date"
            value={invoiceDate}
            onChange={e => onInvoiceDateChange(e.target.value)}
            disabled={readOnly}
          />
        </AxFormGroup>

        <div
          style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-background-secondary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
            {l10n('purchaseOrderEntry.invoicing.invoiceAmount')}
          </AxParagraph>
          <AxParagraph style={{ fontSize: 'var(--font-size-lg)' }}>
            ${po?.total?.toFixed(2) || '0.00'}
          </AxParagraph>
        </div>
      </div>
    </div>
  );
}

