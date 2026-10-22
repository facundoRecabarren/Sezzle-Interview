import React from 'react';
import type { Theme } from '../types/calculation';
import { Button } from './Button';
import './ThemeToggle.css';

export interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <div className="calc-theme-toggle-container">
      <Button
        label={theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        variant="utility"
        onClick={onToggle}
        ariaLabel="Toggle color theme"
        className="calc-theme-toggle-btn"
      />
    </div>
  );
};
