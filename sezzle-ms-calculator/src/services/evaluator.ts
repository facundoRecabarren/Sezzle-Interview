import { CalculationError } from '../errors/calculationError';
import { tokenize, Token } from './tokenizer';

/**
 * Evaluates an expression using recursive-descent parsing with standard mathematical precedence.
 * Grammar:
 * Expression := Term (('+' | '-') Term)*
 * Term       := Factor (('*' | '/') Factor)*
 * Factor     := ('-')? Primary
 * Primary    := NUMBER | '(' Expression ')'
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
      const right = parseTerm();
      if (op === '+') {
        result = result + right;
      } else {
        result = result - right;
      }
    }

    return result;
  }

  function parseTerm(): number {
    let result = parseFactor();

    while (peek() && peek()!.type === 'OPERATOR' && (peek()!.value === '*' || peek()!.value === '/')) {
      const op = consume().value;
      const right = parseFactor();
      if (op === '*') {
        result = result * right;
      } else {
        if (right === 0) {
          throw new CalculationError('Error: division by zero');
        }
        result = result / right;
      }
    }

    return result;
  }

  function parseFactor(): number {
    const nextToken = peek();
    if (!nextToken) {
      throw new CalculationError('Error: Input bad written');
    }

    // Unary minus if not already attached to a number
    if (nextToken.type === 'OPERATOR' && nextToken.value === '-') {
      consume();
      const value = parseFactor();
      return -value;
    }

    return parsePrimary();
  }

  function parsePrimary(): number {
    const token = peek();
    if (!token) {
      throw new CalculationError('Error: Input bad written');
    }

    if (token.type === 'NUMBER') {
      consume();
      const num = Number(token.value);
      if (Number.isNaN(num)) {
        throw new CalculationError('bad written operation');
      }
      return num;
    }

    if (token.type === 'LPAREN') {
      consume(); // consume '('
      const result = parseExpression();
      const close = peek();
      if (!close || close.type !== 'RPAREN') {
        throw new CalculationError('parenthesis missing');
      }
      consume(); // consume ')'
      return result;
    }

    throw new CalculationError('bad written operation');
  }

  const finalResult = parseExpression();

  if (cursor < tokens.length) {
    throw new CalculationError('bad written operation');
  }

  // Handle JavaScript -0 by normalizing to 0
  if (Object.is(finalResult, -0)) {
    return 0;
  }

  return finalResult;
}
