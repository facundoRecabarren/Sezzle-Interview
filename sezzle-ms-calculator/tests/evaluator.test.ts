import { evaluateExpression } from '../src/services/evaluator';
import { CalculationError } from '../src/errors/calculationError';

describe('Expression Evaluator', () => {
  it('evaluates basic arithmetic', () => {
    expect(evaluateExpression('2+2')).toBe(4);
    expect(evaluateExpression('10-3')).toBe(7);
    expect(evaluateExpression('4*5')).toBe(20);
    expect(evaluateExpression('7/2')).toBe(3.5);
  });

  it('respects standard operator precedence (* and / before + and -)', () => {
    expect(evaluateExpression('2+3*4')).toBe(14);
    expect(evaluateExpression('10-4/2')).toBe(8);
    expect(evaluateExpression('(2+3)*4')).toBe(20);
    expect(evaluateExpression('10/2/5')).toBe(1);
  });

  it('handles negative numbers and unary minus', () => {
    expect(evaluateExpression('-5+3')).toBe(-2);
    expect(evaluateExpression('2*-3')).toBe(-6);
    expect(evaluateExpression('2--3')).toBe(5);
    expect(evaluateExpression('-(2+3)')).toBe(-5);
  });

  it('handles decimal values', () => {
    expect(evaluateExpression('0.5+0.25')).toBe(0.75);
    expect(evaluateExpression('3.14*2')).toBe(6.28);
  });

  it('throws division by zero error', () => {
    expect(() => evaluateExpression('4/0')).toThrow(CalculationError);
    expect(() => evaluateExpression('4/0')).toThrow('Error: division by zero');
    expect(() => evaluateExpression('10/(5-5)')).toThrow('Error: division by zero');
  });
});
