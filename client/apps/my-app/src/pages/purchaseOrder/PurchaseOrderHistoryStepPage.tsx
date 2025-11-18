import { useState } from 'react';
import { PurchaseOrderHistoryStepProps } from './types';
import { PurchaseOrderHistoryStepPageRender } from './PurchaseOrderHistoryStepPage.render';
import { useI18n } from '../../i18n/I18nProvider';
import { Vendor } from '../../api/vendorApi';

interface HistoryRecord {
  step: string;
  stepLabel: string;
  timestamp: string;
  notes?: string;
  status?: string;
  data?: Record<string, any>;
}

export function PurchaseOrderHistoryStepPage(props: PurchaseOrderHistoryStepProps) {
  const { po, onAddNote, submitting = false, vendors, readOnly = false } = props;
  const { l10n } = useI18n();
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const getHistoryRecords = (): HistoryRecord[] => {
    if (!po?.jsonData?.history) {
      return [];
    }
    return po.jsonData.history as HistoryRecord[];
  };

  const historyRecords = getHistoryRecords();

  const stepLabels: Record<string, string> = {
    entry: l10n('purchaseOrderEntry.history.step.entry'),
    approval: l10n('purchaseOrderEntry.history.step.approval'),
    received: l10n('purchaseOrderEntry.history.step.received'),
    invoicing: l10n('purchaseOrderEntry.history.step.invoicing'),
    payment: l10n('purchaseOrderEntry.history.step.payment'),
    status_change: l10n('purchaseOrderEntry.history.step.statusChange'),
    note: l10n('purchaseOrderEntry.history.step.note'),
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'DRAFT': l10n('purchaseOrder.status.draft'),
      'PENDING_APPROVAL': l10n('purchaseOrder.status.pendingApproval'),
      'APPROVED': l10n('purchaseOrder.status.approved'),
      'RECEIVED': l10n('purchaseOrder.status.received'),
      'INVOICED': l10n('purchaseOrder.status.invoiced'),
      'PAID': l10n('purchaseOrder.status.paid'),
      'CANCELLED': l10n('purchaseOrder.status.cancelled'),
    };
    return statusMap[status] || status;
  };

  const getVendorName = (vendorId: string): string => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return vendorId;
    return vendor.companyName || `${vendor.lastName} ${vendor.firstName}` || vendor.email || vendorId;
  };

  const getDataKeyLabel = (key: string): string => {
    const keyMap: Record<string, string> = {
      'supplierId': l10n('purchaseOrderEntry.history.data.supplierId'),
      'itemCount': l10n('purchaseOrderEntry.history.data.itemCount'),
      'total': l10n('purchaseOrderEntry.history.data.total'),
      'orderNumber': l10n('purchaseOrderEntry.history.data.orderNumber'),
      'receivedDate': l10n('purchaseOrderEntry.history.data.receivedDate'),
      'invoiceNumber': l10n('purchaseOrderEntry.history.data.invoiceNumber'),
      'invoiceDate': l10n('purchaseOrderEntry.history.data.invoiceDate'),
      'paymentAmount': l10n('purchaseOrderEntry.history.data.paymentAmount'),
      'paymentDate': l10n('purchaseOrderEntry.history.data.paymentDate'),
      'paymentMethod': l10n('purchaseOrderEntry.history.data.paymentMethod'),
      'oldStatus': l10n('purchaseOrderEntry.history.data.oldStatus'),
      'newStatus': l10n('purchaseOrderEntry.history.data.newStatus'),
    };
    return keyMap[key] || key;
  };

  const formatDataValue = (key: string, value: any): string => {
    if (key === 'supplierId') {
      return getVendorName(String(value));
    }
    if (key === 'oldStatus' || key === 'newStatus') {
      return getStatusLabel(String(value));
    }
    return String(value);
  };

  const handleAddNoteClick = () => {
    setNoteText('');
    setNoteDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim() || !po?.id) {
      return;
    }
    try {
      setSavingNote(true);
      await onAddNote(noteText.trim());
      setNoteDialogOpen(false);
      setNoteText('');
    } catch (err) {
      console.error('Error saving note:', err);
      alert(l10n('purchaseOrderEntry.history.saveError'));
    } finally {
      setSavingNote(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <PurchaseOrderHistoryStepPageRender
      {...props}
      historyRecords={historyRecords}
      stepLabels={stepLabels}
      getStatusLabel={getStatusLabel}
      getVendorName={getVendorName}
      getDataKeyLabel={getDataKeyLabel}
      formatDataValue={formatDataValue}
      formatDate={formatDate}
      noteDialogOpen={noteDialogOpen}
      noteText={noteText}
      savingNote={savingNote}
      setNoteDialogOpen={setNoteDialogOpen}
      setNoteText={setNoteText}
      handleAddNoteClick={handleAddNoteClick}
      handleSaveNote={handleSaveNote}
    />
  );
}
