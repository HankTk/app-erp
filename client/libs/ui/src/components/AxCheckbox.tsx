import React from 'react';
import styled from 'styled-components';

export interface AxCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
}

interface StyledCheckboxWrapperProps {
  $error?: boolean;
  $disabled?: boolean;
}

const StyledCheckboxWrapper = styled.label<StyledCheckboxWrapperProps>`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  opacity: ${({ $disabled }) => ($disabled ? 'var(--opacity-disabled)' : '1')};
`;

const StyledCheckboxInput = styled.input.attrs({ type: 'checkbox' })<{ $error?: boolean }>`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid ${({ $error }) =>
  {
    return $error ? 'var(--color-border-error)' : 'var(--color-border-default)';
  }};
  border-radius: var(--radius-sm);
  background-color: var(--color-background-default);
  cursor: pointer;
  position: relative;
  transition: all var(--transition-base);
  flex-shrink: 0;

  &:checked
  {
    background-color: var(--color-primary);
    border-color: var(--color-primary);

    &::after
    {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 5px;
      height: 10px;
      border: solid var(--color-text-inverse);
      border-width: 0 2px 2px 0;
      transform: translate(-50%, -60%) rotate(45deg);
    }
  }

  &:focus
  {
    outline: none;
    box-shadow: ${({ $error }) =>
    {
      return $error ? 'var(--shadow-focus-error)' : 'var(--shadow-focus-sm)';
    }};
  }

  &:hover:not(:disabled):not(:checked)
  {
    border-color: ${({ $error }) =>
    {
      return $error ? 'var(--color-border-error)' : 'var(--color-border-focus)';
    }};
  }

  &:disabled
  {
    background-color: var(--color-background-disabled);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
  }
`;

const StyledCheckboxLabel = styled.span`
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
`;

export const AxCheckbox: React.FC<AxCheckboxProps> = ({
  label,
  error,
  disabled,
  id,
  ...props
}) =>
{
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <StyledCheckboxWrapper $error={error} $disabled={disabled} htmlFor={checkboxId}>
      <StyledCheckboxInput
        id={checkboxId}
        $error={error}
        disabled={disabled}
        {...props}
      />
      {label && <StyledCheckboxLabel>{label}</StyledCheckboxLabel>}
    </StyledCheckboxWrapper>
  );
};

