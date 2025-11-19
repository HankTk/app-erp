import React, { createContext, useContext } from 'react';
import styled from '@emotion/styled';

const TableContext = createContext<{ stickyHeader?: boolean; variant?: 'default' | 'bordered' | 'striped' }>({});

export interface ColumnDefinition<T = any, C = any> {
  key: string;
  label?: string | React.ReactNode;
  header?: string | React.ReactNode;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  render?: (item: T, context?: C) => React.ReactNode;
  variant?: 'default' | 'bordered' | 'striped';
}

export interface AxTableProps<T = any, C = any> extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'children'> {
  variant?: 'default' | 'bordered' | 'striped';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  stickyHeader?: boolean;
  // Generic data-driven API
  data?: T[];
  columns?: ColumnDefinition<T, C>[];
  context?: C;
  getRowKey?: (item: T, index: number) => string | number;
  // Legacy API (children-based)
  children?: React.ReactNode;
}

interface StyledTableProps {
  $variant?: 'default' | 'bordered' | 'striped';
  $size?: 'small' | 'medium' | 'large';
  $fullWidth?: boolean;
  $stickyHeader?: boolean;
}

const StyledTable = styled.table<StyledTableProps>`
  font-family: var(--font-family-base);
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  border-collapse: ${({ $stickyHeader }) => ($stickyHeader ? 'separate' : 'collapse')};
  border-spacing: ${({ $stickyHeader }) => ($stickyHeader ? '0' : 'initial')};
  background-color: var(--color-background-default);
  border-radius: var(--radius-md);
  overflow: ${({ $stickyHeader }) => ($stickyHeader ? 'visible' : 'hidden')};

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

interface StyledTableHeadProps {
  $stickyHeader?: boolean;
}

export const StyledTableHead = styled.thead<StyledTableHeadProps>`
  background-color: var(--color-background-disabled);
  
  ${({ $stickyHeader }) => $stickyHeader && `
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: var(--color-background-default);
  `}
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

export const StyledTableHeader = styled.th<{ $align?: 'left' | 'center' | 'right'; $variant?: 'default' | 'bordered' | 'striped'; $stickyHeader?: boolean }>`
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: ${({ $align = 'left' }) => $align};
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-border-default);
  
  ${({ $stickyHeader }) => $stickyHeader && `
    position: sticky;
    top: 0;
    z-index: 11;
    background-color: var(--color-background-disabled);
  `}
  
  ${({ $variant }) => {
    if ($variant === 'bordered') {
      return `
        border-right: 1px solid var(--color-border-default);
        &:last-of-type {
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
        &:last-of-type {
          border-right: none;
        }
      `;
    }
    return '';
  }}
`;

export function AxTable<T = any, C = any>({
  children,
  variant,
  size,
  fullWidth,
  stickyHeader,
  data,
  columns,
  context,
  getRowKey,
  ...props
}: AxTableProps<T, C>) {
  // If data and columns are provided, use generic data-driven API
  const useGenericAPI = data !== undefined && columns !== undefined;

  const renderContent = () => {
    if (useGenericAPI) {
      // Generic data-driven rendering
      return (
        <>
          <AxTableHead>
            <AxTableRow>
              {columns!.map((column) => (
                <AxTableHeader
                  key={column.key}
                  align={column.headerAlign ?? column.align}
                  variant={column.variant ?? variant}
                >
                  {column.header ?? column.label ?? column.key}
                </AxTableHeader>
              ))}
            </AxTableRow>
          </AxTableHead>
          <AxTableBody>
            {data!.map((item, index) => {
              const rowKey = getRowKey ? getRowKey(item, index) : (item as any)?.id ?? index;
              return (
                <AxTableRow key={rowKey} variant={variant}>
                  {columns!.map((column) => {
                    const cellContent = column.render
                      ? column.render(item, context)
                      : (item as any)?.[column.key] ?? '';
                    return (
                      <AxTableCell
                        key={column.key}
                        align={column.align}
                        variant={column.variant ?? variant}
                      >
                        {cellContent}
                      </AxTableCell>
                    );
                  })}
                </AxTableRow>
              );
            })}
          </AxTableBody>
        </>
      );
    }
    // Legacy children-based API
    return children;
  };

  return (
    <TableContext.Provider value={{ stickyHeader, variant }}>
      <StyledTable
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        $stickyHeader={stickyHeader}
        {...props}
      >
        {renderContent()}
      </StyledTable>
    </TableContext.Provider>
  );
}

// Helper components for easier usage
export interface AxTableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  stickyHeader?: boolean;
}

export const AxTableHead: React.FC<AxTableHeadProps> = ({
  children,
  stickyHeader: stickyHeaderProp,
  ...props
}) => {
  const { stickyHeader: stickyHeaderContext } = useContext(TableContext);
  const stickyHeader = stickyHeaderProp ?? stickyHeaderContext;
  return <StyledTableHead $stickyHeader={stickyHeader} {...props}>{children}</StyledTableHead>;
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
  variant: variantProp,
  ...props
}) => {
  const { variant: variantContext } = useContext(TableContext);
  const variant = variantProp ?? variantContext;
  return (
    <StyledTableRow $variant={variant} {...props}>
      {children}
    </StyledTableRow>
  );
};

export interface AxTableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'bordered' | 'striped';
  stickyHeader?: boolean;
}

export const AxTableHeader: React.FC<AxTableHeaderProps> = ({
  children,
  align,
  variant: variantProp,
  stickyHeader: stickyHeaderProp,
  ...props
}) => {
  const { stickyHeader: stickyHeaderContext, variant: variantContext } = useContext(TableContext);
  const stickyHeader = stickyHeaderProp ?? stickyHeaderContext;
  const variant = variantProp ?? variantContext;
  return (
    <StyledTableHeader $align={align} $variant={variant} $stickyHeader={stickyHeader} {...props}>
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
  variant: variantProp,
  ...props
}) => {
  const { variant: variantContext } = useContext(TableContext);
  const variant = variantProp ?? variantContext;
  return (
    <StyledTableCell $align={align} $variant={variant} {...props}>
      {children}
    </StyledTableCell>
  );
};

