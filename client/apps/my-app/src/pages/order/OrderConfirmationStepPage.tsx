import { OrderConfirmationStepProps } from './types';
import { OrderConfirmationStepPageRender } from './OrderConfirmationStepPage.render';

export function OrderConfirmationStepPage(props: OrderConfirmationStepProps) {
  return <OrderConfirmationStepPageRender {...props} />;
}
