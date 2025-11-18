import { OrderApprovalStepProps } from './types';
import { OrderApprovalStepPageRender } from './OrderApprovalStepPage.render';

export function OrderApprovalStepPage(props: OrderApprovalStepProps) {
  return <OrderApprovalStepPageRender {...props} />;
}
