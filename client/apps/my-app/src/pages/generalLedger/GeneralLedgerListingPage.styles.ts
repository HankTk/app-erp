import styled from '@emotion/styled';
import { AxCard, AxParagraph } from '@ui/components';

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
  flex-wrap: wrap;
`;

export const TableCard = styled(AxCard)`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: calc(100vh - 190px);
  overflow: hidden;
`;

export const TableWrapper = styled.div`
  flex: 1;
  overflow: auto;
  min-height: 0;
  height: 0;
  max-height: 100%;
  position: relative;
`;

export const SummarySection = styled.div`
  flex-shrink: 0;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
`;

export const SummaryItemContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SummaryItemLabel = styled(AxParagraph)`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
`;

interface SummaryItemValueProps {
  $color?: 'error' | 'success' | 'primary' | 'text-primary' | 'text-secondary';
}

export const SummaryItemValue = styled(AxParagraph)<SummaryItemValueProps>`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: ${({ $color = 'text-primary' }) => {
    switch ($color) {
      case 'error':
        return 'var(--color-error)';
      case 'success':
        return 'var(--color-success)';
      case 'primary':
        return 'var(--color-primary)';
      case 'text-primary':
        return 'var(--color-text-primary)';
      case 'text-secondary':
        return 'var(--color-text-secondary)';
      default:
        return 'var(--color-text-primary)';
    }
  }};
`;

