import { PurchaseOrderApprovalStepProps } from './types';
import { PurchaseOrderApprovalStepPageRender } from './PurchaseOrderApprovalStepPage.render';

export function PurchaseOrderApprovalStepPage(props: PurchaseOrderApprovalStepProps) {
  return <PurchaseOrderApprovalStepPageRender {...props} />;
}
