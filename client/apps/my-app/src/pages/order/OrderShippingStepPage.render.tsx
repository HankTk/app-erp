import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup } from '@ui/components';
import { OrderShippingStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';
import { StepContent } from './OrderShippingStepPage.styles';

export function OrderShippingStepPageRender(props: OrderShippingStepProps) {
  const { actualShipDate, trackingNumber, onActualShipDateChange, onTrackingNumberChange, readOnly = false } = props;
  const { l10n } = useI18n();

  return (
    <StepContent>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('orderEntry.shipping.title')}</AxHeading3>
      <AxParagraph marginBottom="lg" color="secondary">
        {l10n('orderEntry.shipping.description')}
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <AxFormGroup>
          <AxLabel>{l10n('orderEntry.shipping.actualShipDate')}</AxLabel>
          <AxInput
            type="date"
            value={actualShipDate}
            onChange={e => onActualShipDateChange(e.target.value)}
            disabled={readOnly}
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{l10n('orderEntry.shipping.trackingNumber')}</AxLabel>
          <AxInput
            type="text"
            value={trackingNumber}
            onChange={e => onTrackingNumberChange(e.target.value)}
            disabled={readOnly}
            placeholder={l10n('orderEntry.shipping.trackingNumberPlaceholder')}
            fullWidth
          />
        </AxFormGroup>
      </div>
    </StepContent>
  );
}

