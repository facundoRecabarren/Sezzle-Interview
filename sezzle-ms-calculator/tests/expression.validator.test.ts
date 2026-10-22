import { validateExpression } from '../src/validators/expression';
import { CalculationError } from '../src/errors/calculationError';

describe('Expression Validator', () => {
  it('accepts valid expressions for v1 and v2', () => {
    expect(validateExpression('2+2')).toBe('2+2');
    expect(validateExpression('2+3*4')).toBe('2+3*4');
    expect(validateExpression('(2+3)*4')).toBe('(2+3)*4');
    expect(validateExpression('3.14*2')).toBe('3.14*2');
    expect(validateExpression('-5+3')).toBe('-5+3');
    expect(validateExpression('2*-3')).toBe('2*-3');
    expect(validateExpression('2--3')).toBe('2--3');

    // v2 expressions
    expect(validateExpression('2^3')).toBe('2^3');
    expect(validateExpression('√9+7')).toBe('√9+7');
    expect(validateExpression('√(9+7)')).toBe('√(9+7)');
    expect(validateExpression('10+50%')).toBe('10+50%');
    expect(validateExpression('200*10%')).toBe('200*10%');
  });

  it('rejects operator without right number', () => {
    expect(() => validateExpression('23+')).toThrow('operator without right number');
    expect(() => validateExpression('(2+3*)')).toThrow('operator without right number');
    expect(() => validateExpression('2^')).toThrow('operator without right number');
    expect(() => validateExpression('√')).toThrow('operator without right number');
  });

  it('rejects missing or unbalanced parenthesis', () => {
    expect(() => validateExpression('(2+3(1*0)')).toThrow('parenthesis missing');
    expect(() => validateExpression('((2+3)')).toThrow('parenthesis missing');
    expect(() => validateExpression('2+3)')).toThrow('parenthesis missing');
  });

  it('rejects bad written operations', () => {
    expect(() => validateExpression('(2++3(1*0)')).toThrow('bad written operation');
    expect(() => validateExpression('2++3')).toThrow('bad written operation');
    expect(() => validateExpression('3(4)')).toThrow('bad written operation');
    expect(() => validateExpression('()')).toThrow('bad written operation');
    expect(() => validateExpression('1.2.3+4')).toThrow('bad written operation');
    expect(() => validateExpression('+3')).toThrow('bad written operation');
    expect(() => validateExpression('*3')).toThrow('bad written operation');
    expect(() => validateExpression('^3')).toThrow('bad written operation');
    expect(() => validateExpression('%5')).toThrow('bad written operation');
    expect(() => validateExpression('3√9')).toThrow('bad written operation');
  });

  it('rejects unallowed characters and whitespace as Input bad written', () => {
    expect(() => validateExpression('2 + 2')).toThrow('Error: Input bad written');
    expect(() => validateExpression('abc')).toThrow('Error: Input bad written');
    expect(() => validateExpression('')).toThrow('Error: Input bad written');
    expect(() => validateExpression(null)).toThrow('Error: Input bad written');
  });
});
