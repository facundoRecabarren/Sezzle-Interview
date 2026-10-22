import { describe, it, expect } from 'vitest';
import { validateInput } from '../lib/validation';

describe('Frontend Validation Module', () => {
  it('validates well-formed expressions (v1 and v2)', () => {
    expect(validateInput('2+2')).toEqual({ isValid: true, errorMessage: null });
    expect(validateInput('2+3*4')).toEqual({ isValid: true, errorMessage: null });
    expect(validateInput('(2+3)*4')).toEqual({ isValid: true, errorMessage: null });
    expect(validateInput('-5+3')).toEqual({ isValid: true, errorMessage: null });
    expect(validateInput('2*-3')).toEqual({ isValid: true, errorMessage: null });
    expect(validateInput('3.14*2')).toEqual({ isValid: true, errorMessage: null });

    // v2 cases
    expect(validateInput('2^3')).toEqual({ isValid: true, errorMessage: null });
    expect(validateInput('√9+7')).toEqual({ isValid: true, errorMessage: null });
    expect(validateInput('√(9+7)')).toEqual({ isValid: true, errorMessage: null });
    expect(validateInput('10+50%')).toEqual({ isValid: true, errorMessage: null });
    expect(validateInput('200*10%')).toEqual({ isValid: true, errorMessage: null });
  });

  it('detects operator without right number', () => {
    expect(validateInput('23+')).toEqual({
      isValid: false,
      errorMessage: 'operator without right number'
    });
    expect(validateInput('2^')).toEqual({
      isValid: false,
      errorMessage: 'operator without right number'
    });
    expect(validateInput('√')).toEqual({
      isValid: false,
      errorMessage: 'operator without right number'
    });
  });

  it('detects missing or unbalanced parentheses', () => {
    expect(validateInput('(2+3(1*0)')).toEqual({
      isValid: false,
      errorMessage: 'parenthesis missing'
    });
    expect(validateInput('((2+3)')).toEqual({
      isValid: false,
      errorMessage: 'parenthesis missing'
    });
  });

  it('detects bad written operations', () => {
    expect(validateInput('(2++3(1*0)')).toEqual({
      isValid: false,
      errorMessage: 'bad written operation'
    });
    expect(validateInput('2++3')).toEqual({
      isValid: false,
      errorMessage: 'bad written operation'
    });
    expect(validateInput('3(4)')).toEqual({
      isValid: false,
      errorMessage: 'bad written operation'
    });
    expect(validateInput('1.2.3')).toEqual({
      isValid: false,
      errorMessage: 'bad written operation'
    });
    expect(validateInput('^3')).toEqual({
      isValid: false,
      errorMessage: 'bad written operation'
    });
    expect(validateInput('%5')).toEqual({
      isValid: false,
      errorMessage: 'bad written operation'
    });
    expect(validateInput('3√9')).toEqual({
      isValid: false,
      errorMessage: 'bad written operation'
    });
  });

  it('rejects empty input, whitespace, and disallowed chars', () => {
    expect(validateInput('')).toEqual({
      isValid: false,
      errorMessage: 'Error: Input bad written'
    });
    expect(validateInput('2 + 2')).toEqual({
      isValid: false,
      errorMessage: 'Error: Input bad written'
    });
    expect(validateInput('2$3')).toEqual({
      isValid: false,
      errorMessage: 'Error: Input bad written'
    });
  });
});
