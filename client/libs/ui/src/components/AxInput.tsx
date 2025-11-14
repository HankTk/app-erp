import React from 'react';
import styled from 'styled-components';

export interface AxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

interface StyledInputProps
{
  $error?: boolean;
  $fullWidth?: boolean;
}

const StyledInput = styled.input<StyledInputProps>`
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  padding: var(--spacing-sm) calc(var(--spacing-sm) + 6px);
  border: 2px solid ${({ $error }) =>
  {
    return $error ? 'var(--color-border-error)' : 'var(--color-border-default)';
  }};
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  width: ${({ $fullWidth }) =>
  {
    return $fullWidth ? '100%' : 'auto';
  }};
  color: var(--color-text-primary);
  background-color: var(--color-background-default);

  &:focus
  {
    border-color: ${({ $error }) =>
    {
      return $error ? 'var(--color-border-error)' : 'var(--color-border-focus)';
    }};
    box-shadow: ${({ $error }) =>
    {
      return $error ? 'var(--shadow-focus-error)' : 'var(--shadow-focus-sm)';
    }};
  }

  &:disabled
  {
    background-color: var(--color-background-disabled);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
  }

  &::placeholder
  {
    color: var(--color-text-tertiary);
  }
`;

export const AxInput: React.FC<AxInputProps> = ({
  error,
  fullWidth,
  ...props
}) =>
{
  return <StyledInput $error={error} $fullWidth={fullWidth} {...props} />;
};

