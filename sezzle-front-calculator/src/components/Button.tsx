import React from 'react';
import './Button.css';

export type ButtonVariant = 'number' | 'operator' | 'utility' | 'danger';

export interface ButtonProps {
  label: React.ReactNode;
  variant?: ButtonVariant;
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'number',
  onClick,
  ariaLabel,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      type="button"
      className={`calc-btn calc-btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
    >
      {label}
    </button>
  );
};
