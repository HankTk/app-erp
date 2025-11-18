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
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: 0;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

export const ContentCard = styled(AxCard)`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg) !important;
  position: relative;
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

export const TableWrapper = styled.div`
  position: relative;
  overflow: visible !important;
  
  table {
    overflow: visible !important;
  }
  
  td {
    overflow: visible !important;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--color-border-default);
  flex-shrink: 0;
`;

export const InfoBox = styled.div`
  padding: var(--spacing-md);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
`;

export const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  background-color: ${props => {
    switch (props.status) {
      case 'RECEIVED': return 'var(--color-info-light)';
      case 'PROCESSED': return 'var(--color-success-light)';
      case 'APPROVED': return 'var(--color-warning-light)';
      default: return 'var(--color-background-secondary)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'RECEIVED': return 'var(--color-info-dark)';
      case 'PROCESSED': return 'var(--color-success-dark)';
      case 'APPROVED': return 'var(--color-warning-dark)';
      default: return 'var(--color-text-primary)';
    }
  }};
`;

