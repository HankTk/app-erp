import { useState } from 'react';
import { OrderEntryStepProps, EntrySubStep } from './types';
import { OrderEntryStepPageRender } from './OrderEntryStepPage.render';

export function OrderEntryStepPage(props: OrderEntryStepProps) {
  const {
    order,
    onAddressesRefresh,
  } = props;
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const isSubStepCompleted = (subStep: EntrySubStep): boolean => {
    if (!order) return false;
    switch (subStep) {
      case 'customer':
        return !!order.customerId;
      case 'products':
        return !!(order.items && order.items.length > 0);
      case 'shipping':
        return !!order.shippingAddressId && !!order.billingAddressId;
      case 'review':
        // Review is completed if customer, products, and shipping are all completed
        return !!order.customerId && 
               !!(order.items && order.items.length > 0) && 
               !!order.shippingAddressId && 
               !!order.billingAddressId;
      default:
        return false;
    }
  };

  const handleCustomerUpdated = async () => {
    // Customer updated - trigger address refresh
    await handleAddressesUpdated();
  };

  const handleAddressesUpdated = async () => {
    // Addresses updated in customer dialog - refresh addresses from parent
    if (onAddressesRefresh) {
      await onAddressesRefresh();
    }
  };

  return (
    <OrderEntryStepPageRender
      {...props}
      isSubStepCompleted={isSubStepCompleted}
      customerDialogOpen={customerDialogOpen}
      setCustomerDialogOpen={setCustomerDialogOpen}
      handleCustomerUpdated={handleCustomerUpdated}
      handleAddressesUpdated={handleAddressesUpdated}
    />
  );
}
