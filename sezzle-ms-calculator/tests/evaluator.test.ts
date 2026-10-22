import { evaluateExpression } from '../src/services/evaluator';
import { CalculationError } from '../src/errors/calculationError';

describe('Expression Evaluator', () => {
  it('evaluates basic arithmetic (v1)', () => {
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

  it('evaluates exponentiation ^ (v2)', () => {
    expect(evaluateExpression('2^3')).toBe(8);
    expect(evaluateExpression('2^3^2')).toBe(512); // right-associative: 2^(3^2) = 2^9 = 512
    expect(evaluateExpression('2+3^2')).toBe(11); // 2 + 9 = 11
    expect(evaluateExpression('(2+3)^2')).toBe(25);
  });

  it('evaluates square root √ (v2)', () => {
    expect(evaluateExpression('√9')).toBe(3);
    expect(evaluateExpression('√9+7')).toBe(10); // per requirements: √9+7 = 3+7 = 10
    expect(evaluateExpression('√(9+7)')).toBe(4); // per requirements: √(9+7) = √16 = 4
    expect(evaluateExpression('2*√16')).toBe(8);
  });

  it('evaluates percentage % (v2)', () => {
    // Requirements: "10+50%=15", taking the 50% of the preceding value
    expect(evaluateExpression('10+50%')).toBe(15);
    expect(evaluateExpression('100-20%')).toBe(80);
    // Multiplicative context:
    expect(evaluateExpression('200*10%')).toBe(20);
    expect(evaluateExpression('50%')).toBe(0.5);
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
