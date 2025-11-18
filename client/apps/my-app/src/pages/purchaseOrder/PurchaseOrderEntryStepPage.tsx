import { useState } from 'react';
import { PurchaseOrderEntryStepProps, EntrySubStep } from './types';
import { PurchaseOrderEntryStepPageRender } from './PurchaseOrderEntryStepPage.render';

export function PurchaseOrderEntryStepPage(props: PurchaseOrderEntryStepProps) {
  const {
    po,
    onAddressesRefresh,
  } = props;
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);

  const isSubStepCompleted = (subStep: EntrySubStep) => {
    if (!po) return false;
    switch (subStep) {
      case 'supplier':
        return !!po.supplierId;
      case 'products':
        return po.items && po.items.length > 0;
      case 'shipping':
        return !!po.shippingAddressId && !!po.billingAddressId;
      case 'review':
        return !!po.supplierId && 
               po.items && po.items.length > 0 && 
               !!po.shippingAddressId && 
               !!po.billingAddressId;
      default:
        return false;
    }
  };

  const handleVendorUpdated = async () => {
    // Vendor updated - trigger address refresh
    await handleAddressesUpdated();
  };

  const handleAddressesUpdated = async () => {
    // Addresses updated in vendor dialog - refresh addresses from parent
    if (onAddressesRefresh) {
      await onAddressesRefresh();
    }
  };

  return (
    <PurchaseOrderEntryStepPageRender
      {...props}
      isSubStepCompleted={isSubStepCompleted}
      vendorDialogOpen={vendorDialogOpen}
      setVendorDialogOpen={setVendorDialogOpen}
      handleVendorUpdated={handleVendorUpdated}
      handleAddressesUpdated={handleAddressesUpdated}
    />
  );
}
