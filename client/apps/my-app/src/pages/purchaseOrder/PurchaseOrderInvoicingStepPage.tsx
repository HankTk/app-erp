import { PurchaseOrderInvoicingStepProps } from './types';
import { PurchaseOrderInvoicingStepPageRender } from './PurchaseOrderInvoicingStepPage.render';

export function PurchaseOrderInvoicingStepPage(props: PurchaseOrderInvoicingStepProps) {
  return <PurchaseOrderInvoicingStepPageRender {...props} />;
}
