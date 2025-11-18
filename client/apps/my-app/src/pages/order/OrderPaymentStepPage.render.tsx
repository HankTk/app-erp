import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup, AxListbox } from '@ui/components';
import { OrderPaymentStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';
import { StepContent, PaymentSummaryBox } from './OrderPaymentStepPage.styles';

export function OrderPaymentStepPageRender(props: OrderPaymentStepProps) {
  const {
    order,
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
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('orderEntry.payment.title')}</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {l10n('orderEntry.payment.description')}
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xsm)' }}>
        <AxFormGroup>
          <AxLabel>{l10n('orderEntry.payment.paymentAmount')}</AxLabel>
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
          <AxLabel>{l10n('orderEntry.payment.paymentDate')}</AxLabel>
          <AxInput
            type="date"
            value={paymentDate}
            onChange={e => onPaymentDateChange(e.target.value)}
            disabled={readOnly}
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{l10n('orderEntry.payment.paymentMethod')}</AxLabel>
          <AxListbox
            options={[
              { value: 'BANK_TRANSFER', label: l10n('orderEntry.payment.method.bankTransfer') },
              { value: 'CREDIT_CARD', label: l10n('orderEntry.payment.method.creditCard') },
              { value: 'CASH', label: l10n('orderEntry.payment.method.cash') },
              { value: 'CHECK', label: l10n('orderEntry.payment.method.check') },
              { value: 'OTHER', label: l10n('orderEntry.payment.method.other') },
            ]}
            value={paymentMethod}
            onChange={onPaymentMethodChange}
            disabled={readOnly}
            placeholder={l10n('orderEntry.payment.paymentMethodPlaceholder')}
            style={{ width: '220px' }}
          />
        </AxFormGroup>

        <PaymentSummaryBox>
          <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
            {l10n('orderEntry.payment.invoiceAmount')}
          </AxParagraph>
          <AxParagraph style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)' }}>
            ${order?.total?.toFixed(2) || '0.00'}
          </AxParagraph>
          {paymentAmount > 0 && (
            <AxParagraph
              style={{
                color: paymentAmount >= (order?.total || 0) ? 'var(--color-success)' : 'var(--color-warning)',
              }}
            >
              {l10n('orderEntry.payment.paymentAmountLabel')} ${paymentAmount.toFixed(2)} {paymentAmount < (order?.total || 0) && l10n('orderEntry.payment.shortage')}
            </AxParagraph>
          )}
        </PaymentSummaryBox>
      </div>
    </StepContent>
  );
}

