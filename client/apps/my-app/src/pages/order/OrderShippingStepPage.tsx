import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup } from '@ui/components';
import { OrderShippingStepProps } from './types';

export function OrderShippingStepPage(props: OrderShippingStepProps) {
  const { actualShipDate, trackingNumber, onActualShipDateChange, onTrackingNumberChange } = props;

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>出荷処理 (Shipping / Fulfillment)</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        実際に商品を出荷し、出荷伝票・納品書を発行します。
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <AxFormGroup>
          <AxLabel>出荷日 (Actual Ship Date)</AxLabel>
          <AxInput
            type="date"
            value={actualShipDate}
            onChange={e => onActualShipDateChange(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>追跡番号 (Tracking Number)</AxLabel>
          <AxInput
            type="text"
            value={trackingNumber}
            onChange={e => onTrackingNumberChange(e.target.value)}
            placeholder="追跡番号を入力してください"
            fullWidth
          />
        </AxFormGroup>
      </div>
    </div>
  );
}

