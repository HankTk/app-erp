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
import styled from 'styled-components';

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
  const { t } = useI18n();
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
    entry: t('purchaseOrderEntry.history.step.entry'),
    approval: t('purchaseOrderEntry.history.step.approval'),
    received: t('purchaseOrderEntry.history.step.received'),
    invoicing: t('purchaseOrderEntry.history.step.invoicing'),
    payment: t('purchaseOrderEntry.history.step.payment'),
    status_change: t('purchaseOrderEntry.history.step.statusChange'),
    note: t('purchaseOrderEntry.history.step.note'),
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'DRAFT': t('purchaseOrder.status.draft'),
      'PENDING_APPROVAL': t('purchaseOrder.status.pendingApproval'),
      'APPROVED': t('purchaseOrder.status.approved'),
      'RECEIVED': t('purchaseOrder.status.received'),
      'INVOICED': t('purchaseOrder.status.invoiced'),
      'PAID': t('purchaseOrder.status.paid'),
      'CANCELLED': t('purchaseOrder.status.cancelled'),
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
      'supplierId': t('purchaseOrderEntry.history.data.supplierId'),
      'itemCount': t('purchaseOrderEntry.history.data.itemCount'),
      'total': t('purchaseOrderEntry.history.data.total'),
      'orderNumber': t('purchaseOrderEntry.history.data.orderNumber'),
      'receivedDate': t('purchaseOrderEntry.history.data.receivedDate'),
      'invoiceNumber': t('purchaseOrderEntry.history.data.invoiceNumber'),
      'invoiceDate': t('purchaseOrderEntry.history.data.invoiceDate'),
      'paymentAmount': t('purchaseOrderEntry.history.data.paymentAmount'),
      'paymentDate': t('purchaseOrderEntry.history.data.paymentDate'),
      'paymentMethod': t('purchaseOrderEntry.history.data.paymentMethod'),
      'oldStatus': t('purchaseOrderEntry.history.data.oldStatus'),
      'newStatus': t('purchaseOrderEntry.history.data.newStatus'),
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
      alert(t('purchaseOrderEntry.history.saveError'));
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
        <AxHeading3 style={{ margin: 0 }}>{t('purchaseOrderEntry.history.title')}</AxHeading3>
        {!readOnly && (
          <AxButton variant="primary" onClick={handleAddNoteClick} disabled={submitting || !po?.id}>
            {t('purchaseOrderEntry.history.addNote')}
          </AxButton>
        )}
      </div>

      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {t('purchaseOrderEntry.history.description')}
      </AxParagraph>

      {historyRecords.length === 0 ? (
        <EmptyState>
          <AxParagraph>{t('purchaseOrderEntry.history.empty')}</AxParagraph>
          <AxParagraph style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
            {t('purchaseOrderEntry.history.emptyDescription')}
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
                <AxTableHeader>{t('purchaseOrderEntry.history.dateTime')}</AxTableHeader>
                <AxTableHeader>{t('purchaseOrderEntry.history.step')}</AxTableHeader>
                <AxTableHeader>{t('purchaseOrderEntry.history.status')}</AxTableHeader>
                <AxTableHeader>{t('purchaseOrderEntry.history.notes')}</AxTableHeader>
                <AxTableHeader>{t('purchaseOrderEntry.history.data')}</AxTableHeader>
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
        title={t('purchaseOrderEntry.history.addNoteTitle')}
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
              {t('purchaseOrderEntry.history.cancel')}
            </AxButton>
            <AxButton variant="primary" onClick={handleSaveNote} disabled={savingNote || !noteText.trim()}>
              {savingNote ? t('purchaseOrderEntry.history.saving') : t('purchaseOrderEntry.history.save')}
            </AxButton>
          </div>
        }
      >
        <AxFormGroup>
          <AxLabel>{t('purchaseOrderEntry.history.note')}</AxLabel>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder={t('purchaseOrderEntry.history.notePlaceholder')}
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

