import styled from '@emotion/styled';
import { AxParagraph } from '@ui/components';

export const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

export const HistoryItem = styled.div`
  padding: var(--spacing-md);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-primary);
`;

export const HistoryItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
`;

export const HistoryItemTitle = styled(AxParagraph)`
  font-weight: var(--font-weight-bold);
  margin: 0;
`;

export const HistoryItemDate = styled(AxParagraph)`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
`;

export const HistoryItemContent = styled(AxParagraph)`
  margin: 0;
  color: var(--color-text-primary);
  white-space: pre-wrap;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-4xl);
  color: var(--color-text-secondary);
`;

