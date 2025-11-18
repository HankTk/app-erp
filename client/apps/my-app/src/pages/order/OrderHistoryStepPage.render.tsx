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
import { debugProps } from '../../utils/emotionCache';
import { HistoryContainer, EmptyState } from './OrderHistoryStepPage.styles';

const COMPONENT_NAME = 'OrderHistoryStepPage';

interface HistoryRecord {
  step: string;
  stepLabel: string;
  timestamp: string;
  notes?: string;
  status?: string;
  data?: Record<string, any>;
}

interface OrderHistoryStepPageRenderProps extends OrderHistoryStepProps {
  historyRecords: HistoryRecord[];
  stepLabels: Record<string, string>;
  getStatusLabel: (status: string) => string;
  getCustomerName: (customerId: string) => string;
  getDataKeyLabel: (key: string) => string;
  formatDataValue: (key: string, value: any) => string;
  formatDate: (dateString: string) => string;
  noteDialogOpen: boolean;
  noteText: string;
  savingNote: boolean;
  setNoteDialogOpen: (open: boolean) => void;
  setNoteText: (text: string) => void;
  handleAddNoteClick: () => void;
  handleSaveNote: () => Promise<void>;
}

export function OrderHistoryStepPageRender(props: OrderHistoryStepPageRenderProps) {
  const {
    order,
    submitting = false,
    readOnly = false,
    historyRecords,
    stepLabels,
    getStatusLabel,
    getCustomerName,
    getDataKeyLabel,
    formatDataValue,
    formatDate,
    noteDialogOpen,
    noteText,
    savingNote,
    setNoteDialogOpen,
    setNoteText,
    handleAddNoteClick,
    handleSaveNote,
  } = props;
  const { l10n } = useI18n();

  return (
    <HistoryContainer {...debugProps(COMPONENT_NAME, 'HistoryContainer')}>
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
        <EmptyState {...debugProps(COMPONENT_NAME, 'EmptyState')}>
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

