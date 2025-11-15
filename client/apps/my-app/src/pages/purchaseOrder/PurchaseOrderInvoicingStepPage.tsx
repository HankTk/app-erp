import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup } from '@ui/components';
import { PurchaseOrderInvoicingStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';

export function PurchaseOrderInvoicingStepPage(props: PurchaseOrderInvoicingStepProps) {
  const { po, invoiceNumber, invoiceDate, onInvoiceNumberChange, onInvoiceDateChange, readOnly = false } = props;
  const { t } = useI18n();

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('purchaseOrderEntry.invoicing.title')}</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {t('purchaseOrderEntry.invoicing.description')}
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <AxFormGroup>
          <AxLabel>{t('purchaseOrderEntry.invoicing.invoiceNumber')}</AxLabel>
          <AxInput
            type="text"
            value={invoiceNumber}
            onChange={e => onInvoiceNumberChange(e.target.value)}
            disabled={readOnly}
            placeholder={t('purchaseOrderEntry.invoicing.invoiceNumberPlaceholder')}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{t('purchaseOrderEntry.invoicing.invoiceDate')}</AxLabel>
          <AxInput
            type="date"
            value={invoiceDate}
            onChange={e => onInvoiceDateChange(e.target.value)}
            disabled={readOnly}
            fullWidth
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
            {t('purchaseOrderEntry.invoicing.invoiceAmount')}
          </AxParagraph>
          <AxParagraph style={{ fontSize: 'var(--font-size-lg)' }}>
            ${po?.total?.toFixed(2) || '0.00'}
          </AxParagraph>
        </div>
      </div>
    </div>
  );
}

