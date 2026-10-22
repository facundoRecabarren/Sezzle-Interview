import React from 'react';
import { Button } from './Button';
import './Keypad.css';

export interface KeypadProps {
  onAppend: (char: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onOpenHistory: () => void;
  isLoading: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onAppend,
  onClear,
  onBackspace,
  onCalculate,
  onOpenHistory,
  isLoading
}) => {
  return (
    <div className="calc-keypad-grid">
      {/* Row 1 */}
      <Button
        label="C"
        variant="utility"
        onClick={onClear}
        ariaLabel="Clear expression"
      />
      <Button
        label="⌫"
        variant="utility"
        onClick={onBackspace}
        ariaLabel="Backspace"
      />
      <Button
        label={
          <span role="img" aria-label="History clock">
            🕒
          </span>
        }
        variant="utility"
        onClick={onOpenHistory}
        ariaLabel="Open history"
      />
      <Button
        label="/"
        variant="operator"
        onClick={() => onAppend('/')}
        ariaLabel="Divide"
      />

      {/* Row 2 */}
      <Button label="7" variant="number" onClick={() => onAppend('7')} />
      <Button label="8" variant="number" onClick={() => onAppend('8')} />
      <Button label="9" variant="number" onClick={() => onAppend('9')} />
      <Button
        label="*"
        variant="operator"
        onClick={() => onAppend('*')}
        ariaLabel="Multiply"
      />

      {/* Row 3 */}
      <Button label="4" variant="number" onClick={() => onAppend('4')} />
      <Button label="5" variant="number" onClick={() => onAppend('5')} />
      <Button label="6" variant="number" onClick={() => onAppend('6')} />
      <Button
        label="-"
        variant="operator"
        onClick={() => onAppend('-')}
        ariaLabel="Subtract"
      />

      {/* Row 4 */}
      <Button label="1" variant="number" onClick={() => onAppend('1')} />
      <Button label="2" variant="number" onClick={() => onAppend('2')} />
      <Button label="3" variant="number" onClick={() => onAppend('3')} />
      <Button
        label="+"
        variant="operator"
        onClick={() => onAppend('+')}
        ariaLabel="Add"
      />

      {/* Row 5 */}
      <Button label="(" variant="utility" onClick={() => onAppend('(')} />
      <Button label=")" variant="utility" onClick={() => onAppend(')')} />
      <Button label="0" variant="number" onClick={() => onAppend('0')} />
      <Button label="." variant="number" onClick={() => onAppend('.')} />

      {/* Row 6: Run equals button span */}
      <Button
        label={isLoading ? '...' : '='}
        variant="operator"
        onClick={onCalculate}
        disabled={isLoading}
        className="calc-btn-equals"
        ariaLabel="Calculate result"
      />
    </div>
  );
};
