import { useState } from 'react';
import {
  AxHeading3,
  AxParagraph,
  AxButton,
  AxDialog,
  AxLabel,
  AxFormGroup,
} from '@ui/components';
import { OrderHistoryStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';
import { Customer } from '../../api/customerApi';
import styled from 'styled-components';

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
  const { order, onAddNote, submitting = false, customers } = props;
  const { t } = useI18n();
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
    entry: t('orderEntry.history.step.entry'),
    approval: t('orderEntry.history.step.approval'),
    confirmation: t('orderEntry.history.step.confirmation'),
    shipping_instruction: t('orderEntry.history.step.shippingInstruction'),
    shipping: t('orderEntry.history.step.shipping'),
    invoicing: t('orderEntry.history.step.invoicing'),
    payment: t('orderEntry.history.step.payment'),
    status_change: t('orderEntry.history.step.statusChange'),
    note: t('orderEntry.history.step.note'),
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'DRAFT': t('orderEntry.status.draft'),
      'PENDING_APPROVAL': t('orderEntry.status.pendingApproval'),
      'APPROVED': t('orderEntry.status.approved'),
      'SHIPPING_INSTRUCTED': t('orderEntry.status.shippingInstructed'),
      'SHIPPED': t('orderEntry.status.shipped'),
      'INVOICED': t('orderEntry.status.invoiced'),
      'PAID': t('orderEntry.status.paid'),
      'CANCELLED': t('orderEntry.status.cancelled'),
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
      'customerId': t('orderEntry.history.data.customerId'),
      'itemCount': t('orderEntry.history.data.itemCount'),
      'total': t('orderEntry.history.data.total'),
      'orderNumber': t('orderEntry.history.data.orderNumber'),
      'requestedShipDate': t('orderEntry.history.data.requestedShipDate'),
      'shipDate': t('orderEntry.history.data.shipDate'),
      'trackingNumber': t('orderEntry.history.data.trackingNumber'),
      'invoiceNumber': t('orderEntry.history.data.invoiceNumber'),
      'invoiceDate': t('orderEntry.history.data.invoiceDate'),
      'paymentAmount': t('orderEntry.history.data.paymentAmount'),
      'paymentDate': t('orderEntry.history.data.paymentDate'),
      'paymentMethod': t('orderEntry.history.data.paymentMethod'),
      'oldStatus': t('orderEntry.history.data.oldStatus'),
      'newStatus': t('orderEntry.history.data.newStatus'),
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
      alert(t('orderEntry.history.saveError'));
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
        <AxHeading3 style={{ margin: 0 }}>{t('orderEntry.history.title')}</AxHeading3>
        <AxButton variant="primary" onClick={handleAddNoteClick} disabled={submitting || !order?.id}>
          {t('orderEntry.history.addNote')}
        </AxButton>
      </div>

      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {t('orderEntry.history.description')}
      </AxParagraph>

      {historyRecords.length === 0 ? (
        <EmptyState>
          <AxParagraph>{t('orderEntry.history.empty')}</AxParagraph>
          <AxParagraph style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
            {t('orderEntry.history.emptyDescription')}
          </AxParagraph>
        </EmptyState>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {historyRecords
            .slice()
            .reverse()
            .map((record, index) => (
              <HistoryItem key={index}>
                <HistoryItemHeader>
                  <HistoryItemTitle>
                    {stepLabels[record.step] || record.stepLabel || record.step}
                  </HistoryItemTitle>
                  <HistoryItemDate>{formatDate(record.timestamp)}</HistoryItemDate>
                </HistoryItemHeader>
                {record.status && (
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    {t('orderEntry.history.status')} {getStatusLabel(record.status)}
                  </AxParagraph>
                )}
                {record.notes && (
                  <HistoryItemContent>{record.notes}</HistoryItemContent>
                )}
                {record.data && Object.keys(record.data).length > 0 && (
                  <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {Object.entries(record.data).map(([key, value]) => (
                      <div key={key} style={{ marginTop: 'var(--spacing-xs)' }}>
                        <strong>{getDataKeyLabel(key)}:</strong> {formatDataValue(key, value)}
                      </div>
                    ))}
                  </div>
                )}
              </HistoryItem>
            ))}
        </div>
      )}

      <AxDialog
        open={noteDialogOpen}
        onClose={() => {
          setNoteDialogOpen(false);
          setNoteText('');
        }}
        title={t('orderEntry.history.addNoteTitle')}
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
              {t('orderEntry.history.cancel')}
            </AxButton>
            <AxButton variant="primary" onClick={handleSaveNote} disabled={savingNote || !noteText.trim()}>
              {savingNote ? t('orderEntry.history.saving') : t('orderEntry.history.save')}
            </AxButton>
          </div>
        }
      >
        <AxFormGroup>
          <AxLabel>{t('orderEntry.history.note')}</AxLabel>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder={t('orderEntry.history.notePlaceholder')}
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

