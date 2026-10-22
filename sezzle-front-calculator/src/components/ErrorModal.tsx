import React from 'react';
import { Button } from './Button';
import './Modal.css';

export interface ErrorModalProps {
  isOpen: boolean;
  errorMessage: string | null;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  errorMessage,
  onClose
}) => {
  if (!isOpen || !errorMessage) return null;

  return (
    <div className="calc-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Error Alert">
      <div className="calc-modal-content calc-modal-content-error" onClick={(e) => e.stopPropagation()}>
        <div className="calc-modal-header">
          <h3 className="calc-modal-error-title">Backend Error</h3>
          <button className="calc-modal-close-btn" onClick={onClose} aria-label="Close error modal">
            ✕
          </button>
        </div>

        <div className="calc-modal-body">
          <p className="calc-modal-error-msg">{errorMessage}</p>
        </div>

        <div className="calc-modal-footer">
          <Button label="Acknowledge" variant="operator" onClick={onClose} ariaLabel="Acknowledge error" />
        </div>
      </div>
    </div>
  );
};
