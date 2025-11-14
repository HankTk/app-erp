import React from 'react';
import styled from 'styled-components';

export const AxButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-xl);
`;

export interface AxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  fontSize?: string;
  fontWeight?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number | string;
}

interface StyledButtonProps
{
  $variant?: 'primary' | 'secondary' | 'danger';
  $size?: 'small' | 'medium' | 'large';
  $fullWidth?: boolean;
  $fontSize?: string;
  $fontWeight?: string;
  $position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  $top?: string;
  $right?: string;
  $bottom?: string;
  $left?: string;
  $zIndex?: number | string;
}

const StyledButton = styled.button<StyledButtonProps>`
  font-family: var(--font-family-base);
  font-weight: ${({ $fontWeight }) =>
  {
    return $fontWeight || 'var(--font-weight-medium)';
  }};
  line-height: var(--line-height-normal);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);

  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}

  ${({ $position }) => $position && `position: ${$position};`}
  ${({ $top }) => $top && `top: ${$top};`}
  ${({ $right }) => $right && `right: ${$right};`}
  ${({ $bottom }) => $bottom && `bottom: ${$bottom};`}
  ${({ $left }) => $left && `left: ${$left};`}
  ${({ $zIndex }) => $zIndex !== undefined && `z-index: ${$zIndex};`}

  ${({ $size = 'medium', $fontSize }) =>
  {
    const fontSize = $fontSize || (() =>
    {
      switch ($size)
      {
        case 'small':
          return 'var(--font-size-sm)';
        case 'large':
          return 'var(--font-size-md)';
        default:
          return 'var(--font-size-base)';
      }
    })();

    switch ($size)
    {
      case 'small':
        return `
          padding: var(--spacing-xs) var(--spacing-md);
          font-size: ${fontSize};
        `;
      case 'large':
        return `
          padding: var(--spacing-md) var(--spacing-2xl);
          font-size: ${fontSize};
        `;
      default:
        return `
          padding: calc(var(--spacing-sm) + 2px) var(--spacing-xl);
          font-size: ${fontSize};
        `;
    }
  }}

  ${({ $variant = 'primary' }) =>
  {
    switch ($variant)
    {
      case 'primary':
        return `
          background-color: var(--color-primary);
          color: var(--color-text-inverse);
          &:hover:not(:disabled)
          {
            background-color: var(--color-primary-hover);
          }
          &:active:not(:disabled)
          {
            background-color: var(--color-primary-active);
          }
          &:disabled
          {
            background-color: var(--color-disabled);
            cursor: not-allowed;
            opacity: var(--opacity-disabled);
          }
        `;
      case 'secondary':
        return `
          background-color: var(--color-secondary);
          color: var(--color-text-inverse);
          &:hover:not(:disabled)
          {
            background-color: var(--color-secondary-hover);
          }
          &:active:not(:disabled)
          {
            background-color: var(--color-secondary-active);
          }
          &:disabled
          {
            background-color: var(--color-disabled-light);
            cursor: not-allowed;
            opacity: var(--opacity-disabled);
          }
        `;
      case 'danger':
        return `
          background-color: var(--color-danger);
          color: var(--color-text-inverse);
          &:hover:not(:disabled)
          {
            background-color: var(--color-danger-hover);
          }
          &:active:not(:disabled)
          {
            background-color: var(--color-danger-active);
          }
          &:disabled
          {
            background-color: var(--color-disabled-light);
            cursor: not-allowed;
            opacity: var(--opacity-disabled);
          }
        `;
    }
  }}
`;

export const AxButton: React.FC<AxButtonProps> = ({
  children,
  variant,
  size,
  fullWidth,
  fontSize,
  fontWeight,
  position,
  top,
  right,
  bottom,
  left,
  zIndex,
  ...props
}) =>
{
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $fontSize={fontSize}
      $fontWeight={fontWeight}
      $position={position}
      $top={top}
      $right={right}
      $bottom={bottom}
      $left={left}
      $zIndex={zIndex}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

