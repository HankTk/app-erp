import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup } from '@ui/components';
import { OrderShippingStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';

export function OrderShippingStepPage(props: OrderShippingStepProps) {
  const { actualShipDate, trackingNumber, onActualShipDateChange, onTrackingNumberChange, readOnly = false } = props;
  const { t } = useI18n();

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('orderEntry.shipping.title')}</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {t('orderEntry.shipping.description')}
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <AxFormGroup>
          <AxLabel>{t('orderEntry.shipping.actualShipDate')}</AxLabel>
          <AxInput
            type="date"
            value={actualShipDate}
            onChange={e => onActualShipDateChange(e.target.value)}
            disabled={readOnly}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{t('orderEntry.shipping.trackingNumber')}</AxLabel>
          <AxInput
            type="text"
            value={trackingNumber}
            onChange={e => onTrackingNumberChange(e.target.value)}
            disabled={readOnly}
            placeholder={t('orderEntry.shipping.trackingNumberPlaceholder')}
            fullWidth
          />
        </AxFormGroup>
      </div>
    </div>
  );
}

