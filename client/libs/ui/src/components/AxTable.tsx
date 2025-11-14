import React from 'react';
import styled from 'styled-components';

export interface AxTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'bordered' | 'striped';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

interface StyledTableProps {
  $variant?: 'default' | 'bordered' | 'striped';
  $size?: 'small' | 'medium' | 'large';
  $fullWidth?: boolean;
}

const StyledTable = styled.table<StyledTableProps>`
  font-family: var(--font-family-base);
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  border-collapse: collapse;
  background-color: var(--color-background-default);
  border-radius: var(--radius-md);
  overflow: hidden;

  ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return `
          font-size: var(--font-size-sm);
        `;
      case 'large':
        return `
          font-size: var(--font-size-lg);
        `;
      default:
        return `
          font-size: var(--font-size-base);
        `;
    }
  }}

  ${({ $variant = 'default' }) => {
    switch ($variant) {
      case 'bordered':
        return `
          border: 1px solid var(--color-border-default);
        `;
      case 'striped':
        return `
          tbody tr:nth-child(even) {
            background-color: var(--color-background-disabled);
          }
        `;
      default:
        return '';
    }
  }}
`;

export const StyledTableHead = styled.thead`
  background-color: var(--color-background-disabled);
`;

export const StyledTableBody = styled.tbody``;

export const StyledTableRow = styled.tr<{ $variant?: 'default' | 'bordered' | 'striped' }>`
  transition: background-color var(--transition-base);
  
  &:hover {
    background-color: var(--color-background-hover);
  }

  ${({ $variant }) => {
    if ($variant === 'bordered') {
      return `
        border-bottom: 1px solid var(--color-border-default);
      `;
    }
    return '';
  }}
`;

export const StyledTableHeader = styled.th<{ $align?: 'left' | 'center' | 'right'; $variant?: 'default' | 'bordered' | 'striped' }>`
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: ${({ $align = 'left' }) => $align};
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-border-default);
  
  ${({ $variant }) => {
    if ($variant === 'bordered') {
      return `
        border-right: 1px solid var(--color-border-default);
        &:last-child {
          border-right: none;
        }
      `;
    }
    return '';
  }}
`;

export const StyledTableCell = styled.td<{ $align?: 'left' | 'center' | 'right'; $variant?: 'default' | 'bordered' | 'striped' }>`
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: ${({ $align = 'left' }) => $align};
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-default);
  
  ${({ $variant }) => {
    if ($variant === 'bordered') {
      return `
        border-right: 1px solid var(--color-border-default);
        &:last-child {
          border-right: none;
        }
      `;
    }
    return '';
  }}
`;

export const AxTable: React.FC<AxTableProps> = ({
  children,
  variant,
  size,
  fullWidth,
  ...props
}) => {
  return (
    <StyledTable
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      {...props}
    >
      {children}
    </StyledTable>
  );
};

// Helper components for easier usage
export const AxTableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  ...props
}) => {
  return <StyledTableHead {...props}>{children}</StyledTableHead>;
};

export const AxTableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  ...props
}) => {
  return <StyledTableBody {...props}>{children}</StyledTableBody>;
};

export interface AxTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  variant?: 'default' | 'bordered' | 'striped';
}

export const AxTableRow: React.FC<AxTableRowProps> = ({
  children,
  variant,
  ...props
}) => {
  return (
    <StyledTableRow $variant={variant} {...props}>
      {children}
    </StyledTableRow>
  );
};

export interface AxTableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'bordered' | 'striped';
}

export const AxTableHeader: React.FC<AxTableHeaderProps> = ({
  children,
  align,
  variant,
  ...props
}) => {
  return (
    <StyledTableHeader $align={align} $variant={variant} {...props}>
      {children}
    </StyledTableHeader>
  );
};

export interface AxTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'bordered' | 'striped';
}

export const AxTableCell: React.FC<AxTableCellProps> = ({
  children,
  align,
  variant,
  ...props
}) => {
  return (
    <StyledTableCell $align={align} $variant={variant} {...props}>
      {children}
    </StyledTableCell>
  );
};

