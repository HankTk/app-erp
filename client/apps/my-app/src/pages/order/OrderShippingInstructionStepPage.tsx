import { OrderShippingInstructionStepProps } from './types';
import { OrderShippingInstructionStepPageRender } from './OrderShippingInstructionStepPage.render';

export function OrderShippingInstructionStepPage(props: OrderShippingInstructionStepProps) {
  return <OrderShippingInstructionStepPageRender {...props} />;
}
