import { OrderPaymentStepProps } from './types';
import { OrderPaymentStepPageRender } from './OrderPaymentStepPage.render';

export function OrderPaymentStepPage(props: OrderPaymentStepProps) {
  return <OrderPaymentStepPageRender {...props} />;
}
