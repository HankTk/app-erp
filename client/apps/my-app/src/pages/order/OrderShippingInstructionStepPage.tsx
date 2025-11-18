import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup } from '@ui/components';
import { OrderShippingInstructionStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';

export function OrderShippingInstructionStepPage(props: OrderShippingInstructionStepProps) {
  const {
    shippingInstructions,
    requestedShipDate,
    onShippingInstructionsChange,
    onRequestedShipDateChange,
    readOnly = false,
  } = props;
  const { l10n } = useI18n();

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('orderEntry.shippingInstruction.title')}</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {l10n('orderEntry.shippingInstruction.description')}
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <AxFormGroup>
          <AxLabel>{l10n('orderEntry.shippingInstruction.requestedShipDate')}</AxLabel>
          <AxInput
            type="date"
            value={requestedShipDate}
            onChange={e => onRequestedShipDateChange(e.target.value)}
            disabled={readOnly}
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{l10n('orderEntry.shippingInstruction.notes')}</AxLabel>
          <textarea
            value={shippingInstructions}
            onChange={e => onShippingInstructionsChange(e.target.value)}
            disabled={readOnly}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              fontFamily: 'inherit',
            }}
            placeholder={l10n('orderEntry.shippingInstruction.notesPlaceholder')}
          />
        </AxFormGroup>
      </div>
    </div>
  );
}

