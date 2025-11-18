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
import { PurchaseOrderHistoryStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';
import { Vendor } from '../../api/vendorApi';
import styled from '@emotion/styled';

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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
    <HistoryContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <AxHeading3 style={{ margin: 0 }}>{l10n('purchaseOrderEntry.history.title')}</AxHeading3>
        {!readOnly && (
          <AxButton variant="primary" onClick={handleAddNoteClick} disabled={submitting || !po?.id}>
            {l10n('purchaseOrderEntry.history.addNote')}
          </AxButton>
        )}
      </div>

      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {l10n('purchaseOrderEntry.history.description')}
      </AxParagraph>

      {historyRecords.length === 0 ? (
        <EmptyState>
          <AxParagraph>{l10n('purchaseOrderEntry.history.empty')}</AxParagraph>
          <AxParagraph style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
            {l10n('purchaseOrderEntry.history.emptyDescription')}
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
                <AxTableHeader>{l10n('purchaseOrderEntry.history.dateTime')}</AxTableHeader>
                <AxTableHeader>{l10n('purchaseOrderEntry.history.step')}</AxTableHeader>
                <AxTableHeader>{l10n('purchaseOrderEntry.history.status')}</AxTableHeader>
                <AxTableHeader>{l10n('purchaseOrderEntry.history.notes')}</AxTableHeader>
                <AxTableHeader>{l10n('purchaseOrderEntry.history.data')}</AxTableHeader>
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
        title={l10n('purchaseOrderEntry.history.addNoteTitle')}
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
              {l10n('purchaseOrderEntry.history.cancel')}
            </AxButton>
            <AxButton variant="primary" onClick={handleSaveNote} disabled={savingNote || !noteText.trim()}>
              {savingNote ? l10n('purchaseOrderEntry.history.saving') : l10n('purchaseOrderEntry.history.save')}
            </AxButton>
          </div>
        }
      >
        <AxFormGroup>
          <AxLabel>{l10n('purchaseOrderEntry.history.note')}</AxLabel>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder={l10n('purchaseOrderEntry.history.notePlaceholder')}
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

