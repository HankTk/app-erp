import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup, AxListbox } from '@ui/components';
import { PurchaseOrderPaymentStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';

export function PurchaseOrderPaymentStepPage(props: PurchaseOrderPaymentStepProps) {
  const {
    po,
    paymentAmount,
    paymentDate,
    paymentMethod,
    onPaymentAmountChange,
    onPaymentDateChange,
    onPaymentMethodChange,
    readOnly = false,
  } = props;
  const { l10n } = useI18n();

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('purchaseOrderEntry.payment.title')}</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {l10n('purchaseOrderEntry.payment.description')}
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xsm)' }}>
        <AxFormGroup>
          <AxLabel>{l10n('purchaseOrderEntry.payment.paymentAmount')}</AxLabel>
          <AxInput
            type="number"
            value={paymentAmount || ''}
            onChange={e => onPaymentAmountChange(parseFloat(e.target.value) || 0)}
            disabled={readOnly}
            placeholder="0.00"
            style={{ width: '220px' }}
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{l10n('purchaseOrderEntry.payment.paymentDate')}</AxLabel>
          <AxInput
            type="date"
            value={paymentDate}
            onChange={e => onPaymentDateChange(e.target.value)}
            disabled={readOnly}
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{l10n('purchaseOrderEntry.payment.paymentMethod')}</AxLabel>
          <AxListbox
            options={[
              { value: 'BANK_TRANSFER', label: l10n('purchaseOrderEntry.payment.method.bankTransfer') },
              { value: 'CREDIT_CARD', label: l10n('purchaseOrderEntry.payment.method.creditCard') },
              { value: 'CASH', label: l10n('purchaseOrderEntry.payment.method.cash') },
              { value: 'CHECK', label: l10n('purchaseOrderEntry.payment.method.check') },
              { value: 'OTHER', label: l10n('purchaseOrderEntry.payment.method.other') },
            ]}
            value={paymentMethod}
            onChange={onPaymentMethodChange}
            disabled={readOnly}
            placeholder={l10n('purchaseOrderEntry.payment.paymentMethodPlaceholder')}
            style={{ width: '220px' }}
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
            {l10n('purchaseOrderEntry.payment.invoiceAmount')}
          </AxParagraph>
          <AxParagraph style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)' }}>
            ${po?.total?.toFixed(2) || '0.00'}
          </AxParagraph>
          {paymentAmount > 0 && (
            <AxParagraph
              style={{
                color: paymentAmount >= (po?.total || 0) ? 'var(--color-success)' : 'var(--color-warning)',
              }}
            >
              {l10n('purchaseOrderEntry.payment.paymentAmountLabel')} ${paymentAmount.toFixed(2)} {paymentAmount < (po?.total || 0) && l10n('purchaseOrderEntry.payment.shortage')}
            </AxParagraph>
          )}
        </div>
      </div>
    </div>
  );
}

