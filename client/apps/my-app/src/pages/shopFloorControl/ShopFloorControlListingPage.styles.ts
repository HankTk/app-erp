import styled from '@emotion/styled';
import { AxCard } from '@ui/components';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  padding: var(--spacing-lg);
  box-sizing: border-box;
  flex: 1;
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

export const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  background-color: ${props => {
    switch (props.status) {
      case 'IN_PROGRESS': return 'var(--color-info-light)';
      case 'COMPLETED': return 'var(--color-success-light)';
      case 'PENDING': return 'var(--color-warning-light)';
      case 'CANCELLED': return 'var(--color-danger-light)';
      default: return 'var(--color-background-secondary)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'IN_PROGRESS': return 'var(--color-info-dark)';
      case 'COMPLETED': return 'var(--color-success-dark)';
      case 'PENDING': return 'var(--color-warning-dark)';
      case 'CANCELLED': return 'var(--color-danger-dark)';
      default: return 'var(--color-text-primary)';
    }
  }};
`;

