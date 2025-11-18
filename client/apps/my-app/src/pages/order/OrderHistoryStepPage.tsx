import { useState } from 'react';
import {
  AxHeading3,
  AxParagraph,
  AxButton,
  AxDialog,
  AxLabel,
  AxFormGroup,
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
} from '@ui/components';
import { OrderHistoryStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';
import { Customer } from '../../api/customerApi';
import styled from '@emotion/styled';

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const HistoryItem = styled.div`
  padding: var(--spacing-md);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-primary);
`;

const HistoryItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
`;

const HistoryItemTitle = styled(AxParagraph)`
  font-weight: var(--font-weight-bold);
  margin: 0;
`;

const HistoryItemDate = styled(AxParagraph)`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
`;

const HistoryItemContent = styled(AxParagraph)`
  margin: 0;
  color: var(--color-text-primary);
  white-space: pre-wrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-4xl);
  color: var(--color-text-secondary);
`;

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
    <HistoryContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <AxHeading3 style={{ margin: 0 }}>{l10n('orderEntry.history.title')}</AxHeading3>
        <AxButton variant="primary" onClick={handleAddNoteClick} disabled={submitting || !order?.id}>
          {l10n('orderEntry.history.addNote')}
        </AxButton>
      </div>

      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {l10n('orderEntry.history.description')}
      </AxParagraph>

      {historyRecords.length === 0 ? (
        <EmptyState>
          <AxParagraph>{l10n('orderEntry.history.empty')}</AxParagraph>
          <AxParagraph style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
            {l10n('orderEntry.history.emptyDescription')}
          </AxParagraph>
        </EmptyState>
      ) : (
        <div 
          style={{ 
            maxHeight: 'calc(100vh - 590px)',
            overflowY: 'auto',
            overflowX: 'auto',
          }}
        >
          <AxTable fullWidth>
            <AxTableHead>
              <AxTableRow>
                <AxTableHeader>Date / Time</AxTableHeader>
                <AxTableHeader>Step</AxTableHeader>
                <AxTableHeader>Status</AxTableHeader>
                <AxTableHeader>Notes</AxTableHeader>
                <AxTableHeader>Data</AxTableHeader>
              </AxTableRow>
            </AxTableHead>
            <AxTableBody>
              {historyRecords
                .slice()
                .reverse()
                .map((record, index) => (
                  <AxTableRow key={index}>
                    <AxTableCell style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(record.timestamp)}
                    </AxTableCell>
                    <AxTableCell>
                      {stepLabels[record.step] || record.stepLabel || record.step}
                    </AxTableCell>
                    <AxTableCell>
                      {record.status ? getStatusLabel(record.status) : '-'}
                    </AxTableCell>
                    <AxTableCell style={{ whiteSpace: 'pre-wrap', maxWidth: '300px' }}>
                      {record.notes || '-'}
                    </AxTableCell>
                    <AxTableCell style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {record.data && Object.keys(record.data).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                          {Object.entries(record.data).map(([key, value]) => (
                            <div key={key}>
                              <strong>{getDataKeyLabel(key)}:</strong> {formatDataValue(key, value)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </AxTableCell>
                  </AxTableRow>
                ))}
            </AxTableBody>
          </AxTable>
        </div>
      )}

      <AxDialog
        open={noteDialogOpen}
        onClose={() => {
          setNoteDialogOpen(false);
          setNoteText('');
        }}
        title={l10n('orderEntry.history.addNoteTitle')}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton
              variant="secondary"
              onClick={() => {
                setNoteDialogOpen(false);
                setNoteText('');
              }}
              disabled={savingNote}
            >
              {l10n('orderEntry.history.cancel')}
            </AxButton>
            <AxButton variant="primary" onClick={handleSaveNote} disabled={savingNote || !noteText.trim()}>
              {savingNote ? l10n('orderEntry.history.saving') : l10n('orderEntry.history.save')}
            </AxButton>
          </div>
        }
      >
        <AxFormGroup>
          <AxLabel>{l10n('orderEntry.history.note')}</AxLabel>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder={l10n('orderEntry.history.notePlaceholder')}
            style={{
              width: '100%',
              minHeight: '150px',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              fontFamily: 'inherit',
              fontSize: 'var(--font-size-base)',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
            disabled={savingNote}
          />
        </AxFormGroup>
      </AxDialog>
    </HistoryContainer>
  );
}

