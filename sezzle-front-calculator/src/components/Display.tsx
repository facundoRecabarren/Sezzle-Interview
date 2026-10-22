import React from 'react';
import './Display.css';

export interface DisplayProps {
  expression: string;
  result: number | null;
  errorMessage: string | null;
  onInputChange: (value: string) => void;
  onEnterPress: () => void;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  errorMessage,
  onInputChange,
  onEnterPress
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnterPress();
    }
  };

  return (
    <div className="calc-display-container">
      <div className="calc-display-result" aria-live="polite">
        {result !== null ? `= ${result}` : ''}
      </div>
      <input
        type="text"
        className="calc-display-input"
        value={expression}
        placeholder="0"
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Calculator input"
        autoFocus
      />
      {errorMessage && (
        <div className="calc-display-error" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
