import { PurchaseOrderPaymentStepProps } from './types';
import { PurchaseOrderPaymentStepPageRender } from './PurchaseOrderPaymentStepPage.render';

export function PurchaseOrderPaymentStepPage(props: PurchaseOrderPaymentStepProps) {
  return <PurchaseOrderPaymentStepPageRender {...props} />;
}
