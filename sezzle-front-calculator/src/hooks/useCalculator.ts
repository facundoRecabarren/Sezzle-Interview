import { useState, useCallback } from 'react';
import { validateInput } from '../lib/validation';
import { calculateApi } from '../lib/api';
import { getHistory, saveOperationToHistory, clearHistory as clearStorageHistory } from '../lib/history';

export function useCalculator() {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>(() => getHistory());

  const handleInputChange = useCallback((value: string) => {
    setExpression(value);
    setValidationError(null);
  }, []);

  const handleAppend = useCallback((char: string) => {
    setExpression((prev) => prev + char);
    setValidationError(null);
  }, []);

  const handleClear = useCallback(() => {
    setExpression('');
    setResult(null);
    setValidationError(null);
  }, []);

  const handleBackspace = useCallback(() => {
    setExpression((prev) => prev.slice(0, -1));
    setValidationError(null);
  }, []);

  const handleCalculate = useCallback(async () => {
    // 1. Validate empty or invalid input
    if (!expression || expression.trim().length === 0) {
      setValidationError('Error: Input bad written');
      return;
    }

    const validation = validateInput(expression);
    if (!validation.isValid) {
      setValidationError(validation.errorMessage);
      return;
    }

    // 2. Call backend
    setIsLoading(true);
    setValidationError(null);
    try {
      const data = await calculateApi(expression);
      setResult(data.result);
      const updatedHistory = saveOperationToHistory(expression);
      setHistory(updatedHistory);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown backend error';
      setBackendError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [expression]);

  const handleSelectHistoryOperation = useCallback((op: string) => {
    setExpression(op);
    setValidationError(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearStorageHistory();
    setHistory([]);
  }, []);

  return {
    expression,
    result,
    validationError,
    backendError,
    isLoading,
    isHistoryOpen,
    history,
    setIsHistoryOpen,
    setBackendError,
    handleInputChange,
    handleAppend,
    handleClear,
    handleBackspace,
    handleCalculate,
    handleSelectHistoryOperation,
    handleClearHistory
  };
}
