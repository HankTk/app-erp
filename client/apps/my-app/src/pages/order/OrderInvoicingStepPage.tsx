import { OrderInvoicingStepProps } from './types';
import { OrderInvoicingStepPageRender } from './OrderInvoicingStepPage.render';

export function OrderInvoicingStepPage(props: OrderInvoicingStepProps) {
  return <OrderInvoicingStepPageRender {...props} />;
}
