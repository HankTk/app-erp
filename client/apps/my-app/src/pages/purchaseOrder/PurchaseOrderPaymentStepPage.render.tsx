import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup, AxListbox } from '@ui/components';
import { PurchaseOrderPaymentStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';
import { StepContent, PaymentSummaryBox } from './PurchaseOrderPaymentStepPage.styles';

export function PurchaseOrderPaymentStepPageRender(props: PurchaseOrderPaymentStepProps) {
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
    <StepContent>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('purchaseOrderEntry.payment.title')}</AxHeading3>
      <AxParagraph marginBottom="lg" color="secondary">
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

        <PaymentSummaryBox>
          <AxParagraph weight="bold" marginBottom="sm">
            {l10n('purchaseOrderEntry.payment.invoiceAmount')}
          </AxParagraph>
          <AxParagraph size="lg" marginBottom="md">
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
        </PaymentSummaryBox>
      </div>
    </StepContent>
  );
}

