import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup } from '@ui/components';
import { OrderShippingInstructionStepProps } from './types';

export function OrderShippingInstructionStepPage(props: OrderShippingInstructionStepProps) {
  const {
    shippingInstructions,
    requestedShipDate,
    onShippingInstructionsChange,
    onRequestedShipDateChange,
  } = props;

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>出荷指示 (Shipping Instruction)</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        倉庫または製造部門に出荷依頼を行います。
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <AxFormGroup>
          <AxLabel>希望出荷日 (Requested Ship Date)</AxLabel>
          <AxInput
            type="date"
            value={requestedShipDate}
            onChange={e => onRequestedShipDateChange(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>出荷指示メモ (Shipping Instructions)</AxLabel>
          <textarea
            value={shippingInstructions}
            onChange={e => onShippingInstructionsChange(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              fontFamily: 'inherit',
            }}
            placeholder="出荷に関する指示を入力してください"
          />
        </AxFormGroup>
      </div>
    </div>
  );
}

