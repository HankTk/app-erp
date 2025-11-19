import { AxHeading3, AxParagraph, AxLabel, AxFormGroup, AxInput } from '@ui/components';
import { PurchaseOrderReceivedStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';
import { StepContent } from './PurchaseOrderReceivedStepPage.styles';

export function PurchaseOrderReceivedStepPageRender(props: PurchaseOrderReceivedStepProps) {
  const {
    receivedDate,
    onReceivedDateChange,
    readOnly = false,
  } = props;
  const { l10n } = useI18n();

  return (
    <StepContent>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('purchaseOrderEntry.received.title')}</AxHeading3>
      <AxParagraph marginBottom="lg" color="secondary">
        {l10n('purchaseOrderEntry.received.description')}
      </AxParagraph>

      <AxFormGroup>
        <AxLabel>{l10n('purchaseOrderEntry.received.date')}</AxLabel>
        <AxInput
          type="date"
          value={receivedDate}
          onChange={e => onReceivedDateChange(e.target.value)}
          disabled={readOnly}
        />
      </AxFormGroup>
    </StepContent>
  );
}

