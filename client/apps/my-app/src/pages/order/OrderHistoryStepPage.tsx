import { useState } from 'react';
import { OrderHistoryStepProps } from './types';
import { OrderHistoryStepPageRender } from './OrderHistoryStepPage.render';
import { useI18n } from '../../i18n/I18nProvider';
import { Customer } from '../../api/customerApi';

interface HistoryRecord {
  step: string;
  stepLabel: string;
  timestamp: string;
  notes?: string;
  status?: string;
  data?: Record<string, any>;
}

export function OrderHistoryStepPage(props: OrderHistoryStepProps) {
  const { order, onAddNote, submitting = false, customers, readOnly = false } = props;
  const { l10n } = useI18n();
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const getHistoryRecords = (): HistoryRecord[] => {
    if (!order?.jsonData?.history) {
      return [];
    }
    return order.jsonData.history as HistoryRecord[];
  };

  const historyRecords = getHistoryRecords();

  const stepLabels: Record<string, string> = {
    entry: l10n('orderEntry.history.step.entry'),
    approval: l10n('orderEntry.history.step.approval'),
    confirmation: l10n('orderEntry.history.step.confirmation'),
    shipping_instruction: l10n('orderEntry.history.step.shippingInstruction'),
    shipping: l10n('orderEntry.history.step.shipping'),
    invoicing: l10n('orderEntry.history.step.invoicing'),
    payment: l10n('orderEntry.history.step.payment'),
    status_change: l10n('orderEntry.history.step.statusChange'),
    note: l10n('orderEntry.history.step.note'),
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'DRAFT': l10n('orderEntry.status.draft'),
      'PENDING_APPROVAL': l10n('orderEntry.status.pendingApproval'),
      'APPROVED': l10n('orderEntry.status.approved'),
      'SHIPPING_INSTRUCTED': l10n('orderEntry.status.shippingInstructed'),
      'SHIPPED': l10n('orderEntry.status.shipped'),
      'INVOICED': l10n('orderEntry.status.invoiced'),
      'PAID': l10n('orderEntry.status.paid'),
      'CANCELLED': l10n('orderEntry.status.cancelled'),
    };
    return statusMap[status] || status;
  };

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return customerId;
    return customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email || customerId;
  };

  const getDataKeyLabel = (key: string): string => {
    const keyMap: Record<string, string> = {
      'customerId': l10n('orderEntry.history.data.customerId'),
      'itemCount': l10n('orderEntry.history.data.itemCount'),
      'total': l10n('orderEntry.history.data.total'),
      'orderNumber': l10n('orderEntry.history.data.orderNumber'),
      'requestedShipDate': l10n('orderEntry.history.data.requestedShipDate'),
      'shipDate': l10n('orderEntry.history.data.shipDate'),
      'trackingNumber': l10n('orderEntry.history.data.trackingNumber'),
      'invoiceNumber': l10n('orderEntry.history.data.invoiceNumber'),
      'invoiceDate': l10n('orderEntry.history.data.invoiceDate'),
      'paymentAmount': l10n('orderEntry.history.data.paymentAmount'),
      'paymentDate': l10n('orderEntry.history.data.paymentDate'),
      'paymentMethod': l10n('orderEntry.history.data.paymentMethod'),
      'oldStatus': l10n('orderEntry.history.data.oldStatus'),
      'newStatus': l10n('orderEntry.history.data.newStatus'),
    };
    return keyMap[key] || key;
  };

  const formatDataValue = (key: string, value: any): string => {
    if (key === 'customerId') {
      return getCustomerName(String(value));
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
    if (!noteText.trim() || !order?.id) {
      return;
    }
    try {
      setSavingNote(true);
      await onAddNote(noteText.trim());
      setNoteDialogOpen(false);
      setNoteText('');
    } catch (err) {
      console.error('Error saving note:', err);
      alert(l10n('orderEntry.history.saveError'));
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
    <OrderHistoryStepPageRender
      {...props}
      historyRecords={historyRecords}
      stepLabels={stepLabels}
      getStatusLabel={getStatusLabel}
      getCustomerName={getCustomerName}
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
