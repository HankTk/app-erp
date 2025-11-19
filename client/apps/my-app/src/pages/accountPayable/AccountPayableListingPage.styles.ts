import styled from '@emotion/styled';
import { AxCard, AxButton, AxHeading3, AxParagraph, AxFormGroup, AxTableCell } from '@ui/components';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  width: 100%;
  padding: var(--spacing-lg);
  box-sizing: border-box;
`;

export const HeaderCard = styled(AxCard)`
  flex-shrink: 0;
  padding: var(--spacing-md) var(--spacing-lg) !important;
`;

export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  gap: var(--spacing-md);
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

export const TableCard = styled(AxCard)`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: calc(100vh - 280px);
  overflow: hidden;
`;

export const BackButton = styled(AxButton)`
  min-width: auto;
  padding: var(--spacing-sm) var(--spacing-md);
`;

export const HeaderTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const HeadingWithMargin = styled(AxHeading3)`
  margin-bottom: var(--spacing-xs);
`;

export const ParagraphSecondary = styled(AxParagraph)`
  color: var(--color-text-secondary);
`;

export const ParagraphDanger = styled(AxParagraph)`
  color: var(--color-danger);
`;

export const FormGroupNoMargin = styled(AxFormGroup)`
  margin: 0;
  min-width: 200px;
`;

export const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
  min-height: 0;
  height: 0;
  max-height: 100%;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

export const OutstandingCell = styled(AxTableCell)<{ $outstanding: number }>`
  color: ${props => props.$outstanding > 0 ? 'var(--color-warning)' : 'var(--color-success)'};
  font-weight: ${props => props.$outstanding > 0 ? 'var(--font-weight-bold)' : 'normal'};
`;

export const StatusBadge = styled.span<{ $status: 'PAID' | 'INVOICED' }>`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  background-color: ${props => props.$status === 'PAID' ? '#05966920' : '#EC489920'};
  color: ${props => props.$status === 'PAID' ? '#059669' : '#EC4899'};
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
`;

