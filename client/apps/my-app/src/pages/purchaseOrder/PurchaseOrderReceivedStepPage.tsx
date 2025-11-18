import { PurchaseOrderReceivedStepProps } from './types';
import { PurchaseOrderReceivedStepPageRender } from './PurchaseOrderReceivedStepPage.render';

export function PurchaseOrderReceivedStepPage(props: PurchaseOrderReceivedStepProps) {
  return <PurchaseOrderReceivedStepPageRender {...props} />;
}
