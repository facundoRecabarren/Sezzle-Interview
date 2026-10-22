import React from 'react';
import { useTheme } from './hooks/useTheme';
import { useCalculator } from './hooks/useCalculator';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { HistoryModal } from './components/HistoryModal';
import { ErrorModal } from './components/ErrorModal';
import { ThemeToggle } from './components/ThemeToggle';
import './theme/theme.css';
import './App.css';

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
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
  } = useCalculator();

  return (
    <main className="calc-app-card">
      <header className="calc-app-header">
        <h1 className="calc-app-title">Sezzle Calculator</h1>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <Display
        expression={expression}
        result={result}
        errorMessage={validationError}
        onInputChange={handleInputChange}
        onEnterPress={handleCalculate}
      />

      <Keypad
        onAppend={handleAppend}
        onClear={handleClear}
        onBackspace={handleBackspace}
        onCalculate={handleCalculate}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isLoading={isLoading}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        history={history}
        onSelectOperation={handleSelectHistoryOperation}
        onClearHistory={handleClearHistory}
        onClose={() => setIsHistoryOpen(false)}
      />

      <ErrorModal
        isOpen={backendError !== null}
        errorMessage={backendError}
        onClose={() => setBackendError(null)}
      />
    </main>
  );
};

export default App;
