import styled from '@emotion/styled';
import { AxCard, AxTable } from '@ui/components';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md);
  box-sizing: border-box;
  flex: 1;
`;

export const HeaderCard = styled(AxCard)`
  flex-shrink: 0;
  padding: var(--spacing-sm) var(--spacing-md) !important;
`;

export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

export const ContentCard = styled(AxCard)`
  display: flex;
  flex-direction: column;
  overflow: visible;
  flex-shrink: 0;
`;

export const StepIndicator = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-border-default);
  flex-shrink: 0;
  align-items: center;
  width: 100%;
`;

export const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  flex: none;
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: center;
  border-radius: var(--radius-md);
  white-space: nowrap;
  font-size: var(--font-size-sm);
  background-color: ${props => 
    props.$active ? 'var(--color-primary)' : 
    props.$completed ? 'var(--color-success)' : 
    'var(--color-background-secondary)'};
  color: ${props => 
    props.$active || props.$completed ? 'var(--color-text-inverse)' : 
    'var(--color-text-secondary)'};
  font-weight: ${props => props.$active ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)'};
  cursor: pointer;
  transition: all var(--transition-base);
`;

export const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  overflow: visible;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 2px solid var(--color-border-default);
  flex-shrink: 0;
`;

export const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-md);
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ItemsTable = styled(AxTable)`
  margin-top: var(--spacing-sm);
`;

