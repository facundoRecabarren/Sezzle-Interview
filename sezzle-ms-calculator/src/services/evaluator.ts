import { CalculationError } from '../errors/calculationError';
import { tokenize, Token } from './tokenizer';

/**
 * Normalizes floating point imprecision caused by IEEE 754 arithmetic (e.g. 0.1 + 0.2 = 0.30000000000000004).
 * Uses 12 decimal places of precision, eliminating epsilon noise while preserving meaningful precision.
 */
function normalizePrecision(value: number): number {
  return parseFloat(value.toPrecision(12));
}

/**
 * Evaluates an expression with standard operator precedence + v2 operations:
 * Precedence hierarchy:
 * 1. Parentheses `(...)` & Primary numbers
 * 2. Prefix unary `√` (Square root) & unary `-`
 * 3. Exponentiation `^` (Right-associative)
 * 4. Multiplication `*` & Division `/` (Left-associative)
 * 5. Addition `+` & Subtraction `-` (Left-associative)
 *
 * Percentage `10+50%=15`:
 * In additive contexts (`+` or `-`), `N%` takes `(N / 100) * leftOperand`.
 * In multiplicative/isolated contexts (`*` or `/`), `N%` evaluates to `(N / 100)`.
 */
export function evaluateExpression(expression: string): number {
  const tokens = tokenize(expression);
  let cursor = 0;

  function peek(): Token | undefined {
    return tokens[cursor];
  }

  function consume(): Token {
    const token = tokens[cursor];
    cursor++;
    return token;
  }

  function parseExpression(): number {
    let result = parseTerm();

    while (peek() && peek()!.type === 'OPERATOR' && (peek()!.value === '+' || peek()!.value === '-')) {
      const op = consume().value;
      
      // Look ahead to evaluate term; if the term is followed by percent, in +/- it applies to left operand
      const right = parseTermWithContext(result, op);
      if (op === '+') {
        result = normalizePrecision(result + right);
      } else {
        result = normalizePrecision(result - right);
      }
    }

    return result;
  }

  function parseTermWithContext(leftContext: number, additiveOp: string): number {
    return parseTerm(leftContext, additiveOp);
  }

  function parseTerm(leftAdditiveContext?: number, additiveOp?: string): number {
    let result = parsePower(leftAdditiveContext, additiveOp);

    while (peek() && peek()!.type === 'OPERATOR' && (peek()!.value === '*' || peek()!.value === '/')) {
      const op = consume().value;
      const right = parsePower(); // Multiplicative context: percent is simply value / 100
      if (op === '*') {
        result = normalizePrecision(result * right);
      } else {
        if (right === 0) {
          throw new CalculationError('Error: division by zero');
        }
        result = normalizePrecision(result / right);
      }
    }

    return result;
  }

  // Exponentiation ^ (right-associative)
  function parsePower(leftAdditiveContext?: number, additiveOp?: string): number {
    const base = parseUnary(leftAdditiveContext, additiveOp);

    if (peek() && peek()!.type === 'OPERATOR' && peek()!.value === '^') {
      consume(); // consume '^'
      const exponent = parsePower(); // right-associative recursion
      return normalizePrecision(Math.pow(base, exponent));
    }

    return base;
  }

  // Unary operators: `-` and `√`
  function parseUnary(leftAdditiveContext?: number, additiveOp?: string): number {
    const nextToken = peek();
    if (!nextToken) {
      throw new CalculationError('Error: Input bad written');
    }

    // Square Root √
    if (nextToken.type === 'SQRT') {
      consume(); // consume '√'
      const val = parseUnary();
      if (val < 0) {
        throw new CalculationError('bad written operation'); // Square root of negative number
      }
      return normalizePrecision(Math.sqrt(val));
    }

    // Unary minus
    if (nextToken.type === 'OPERATOR' && nextToken.value === '-') {
      consume();
      const val = parseUnary();
      return -val;
    }

    return parsePrimary(leftAdditiveContext, additiveOp);
  }

  function parsePrimary(leftAdditiveContext?: number, additiveOp?: string): number {
    const token = peek();
    if (!token) {
      throw new CalculationError('Error: Input bad written');
    }

    let value: number;

    if (token.type === 'NUMBER') {
      consume();
      const num = Number(token.value);
      if (Number.isNaN(num)) {
        throw new CalculationError('bad written operation');
      }
      value = num;
    } else if (token.type === 'LPAREN') {
      consume(); // consume '('
      value = parseExpression();
      const close = peek();
      if (!close || close.type !== 'RPAREN') {
        throw new CalculationError('parenthesis missing');
      }
      consume(); // consume ')'
    } else {
      throw new CalculationError('bad written operation');
    }

    // Check for postfix '%'
    if (peek() && peek()!.type === 'PERCENT') {
      consume(); // consume '%'
      if (leftAdditiveContext !== undefined && (additiveOp === '+' || additiveOp === '-')) {
        // e.g. "10+50%": takes 50% of the preceding value 10 -> 5
        return normalizePrecision((value / 100) * leftAdditiveContext);
      }
      // Isolated or multiplicative: 50% = 0.5
      return normalizePrecision(value / 100);
    }

    return value;
  }

  const finalResult = normalizePrecision(parseExpression());

  if (cursor < tokens.length) {
    throw new CalculationError('bad written operation');
  }

  if (Object.is(finalResult, -0)) {
    return 0;
  }

  return finalResult;
}
