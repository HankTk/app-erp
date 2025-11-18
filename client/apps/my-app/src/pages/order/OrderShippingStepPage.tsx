import { OrderShippingStepProps } from './types';
import { OrderShippingStepPageRender } from './OrderShippingStepPage.render';

export function OrderShippingStepPage(props: OrderShippingStepProps) {
  return <OrderShippingStepPageRender {...props} />;
}
