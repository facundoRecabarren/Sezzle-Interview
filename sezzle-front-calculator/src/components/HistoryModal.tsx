import React from 'react';
import { Button } from './Button';
import './Modal.css';

export interface HistoryModalProps {
  isOpen: boolean;
  history: string[];
  onSelectOperation: (operation: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  history,
  onSelectOperation,
  onClearHistory,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="calc-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Calculation History">
      <div className="calc-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="calc-modal-header">
          <h3>Operation History</h3>
          <button className="calc-modal-close-btn" onClick={onClose} aria-label="Close history modal">
            ✕
          </button>
        </div>

        <div className="calc-modal-body">
          {history.length === 0 ? (
            <p className="calc-modal-empty">No previous operations in this session.</p>
          ) : (
            <ul className="calc-history-list">
              {history.map((op, idx) => (
                <li key={idx} className="calc-history-item">
                  <button
                    className="calc-history-op-btn"
                    onClick={() => {
                      onSelectOperation(op);
                      onClose();
                    }}
                  >
                    {op}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="calc-modal-footer">
          {history.length > 0 && (
            <Button
              label="Clear History"
              variant="utility"
              onClick={onClearHistory}
              ariaLabel="Clear session history"
            />
          )}
          <Button label="Close" variant="operator" onClick={onClose} ariaLabel="Close modal" />
        </div>
      </div>
    </div>
  );
};
