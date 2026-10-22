import { CalculationError } from '../errors/calculationError';
import { tokenize, Token } from '../services/tokenizer';

// Regex allowing numbers, ., +, -, *, /, (, ), ^, √, % and strictly NO whitespace
const ALLOWED_CHARS_REGEX = /^[0-9.+\-*/()^√%]+$/;

export function validateExpression(expression: unknown): string {
  if (typeof expression !== 'string' || expression.trim().length === 0) {
    throw new CalculationError('Error: Input bad written');
  }

  // 1. Strict regex gate: only digits, ., +, -, *, /, (, ), ^, √, %
  if (!ALLOWED_CHARS_REGEX.test(expression)) {
    throw new CalculationError('Error: Input bad written');
  }

  // 2. Structural syntax checks for consecutive operators and bad combinations
  // In v2:
  // - Operators: +, *, /, ^
  // - Unary / prefix: √, -
  // - Postfix: %
  // Disallowed:
  // - ++, **, //, ^^, %%
  // - combinations like +*, *+, ^*, /+, etc.
  // - - followed by +, *, /, ^
  // - operator directly before operator (except a single - for unary negative)
  if (
    /\+{2,}|\*{2,}|\/{2,}|\^{2,}|\%{2,}|√{2,}/.test(expression) ||
    /[+*\/^][+*\/^]/.test(expression) ||
    /-[+*\/^]/.test(expression) ||
    /[+*\/^]-{2,}/.test(expression) ||
    /-{3,}/.test(expression) ||
    /\+-/.test(expression) ||
    /-\+/.test(expression) ||
    /%[0-9(√]/.test(expression) || // % followed by number, paren or sqrt without operator
    /[+*\/^-]%/.test(expression) || // operator directly before % like +%
    /\(%/.test(expression) || // (%
    /%\)/.test(expression) === false && /%[+\-*/^]/.test(expression) === false && expression[expression.length - 1] !== '%' && /%\)/.test(expression) // % must be followed by operator, RPAREN or end
  ) {
    throw new CalculationError('bad written operation');
  }

  // 3. Parentheses balance check
  let openParens = 0;
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];
    if (char === '(') {
      openParens++;
    } else if (char === ')') {
      openParens--;
      if (openParens < 0) {
        throw new CalculationError('parenthesis missing');
      }
    }
  }
  if (openParens !== 0) {
    throw new CalculationError('parenthesis missing');
  }

  // 4. Ending with operator or prefix check (e.g. "23+", "2+3*", "√")
  const lastChar = expression[expression.length - 1];
  if (['+', '-', '*', '/', '^', '√'].includes(lastChar)) {
    throw new CalculationError('operator without right number');
  }

  // 5. Tokenization & structural validation
  const tokens: Token[] = tokenize(expression);

  if (tokens.length === 0) {
    throw new CalculationError('Error: Input bad written');
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const prev = i > 0 ? tokens[i - 1] : null;
    const next = i < tokens.length - 1 ? tokens[i + 1] : null;

    // Validate number token
    if (token.type === 'NUMBER') {
      if (token.value === '.' || token.value === '-' || token.value === '-.') {
        throw new CalculationError('bad written operation');
      }
      // Check multiple decimal points in a single number like 1.2.3
      const dots = (token.value.match(/\./g) || []).length;
      if (dots > 1) {
        throw new CalculationError('bad written operation');
      }
    }

    // Sqrt token: must have an operand on the right (number, lparen, or another sqrt)
    if (token.type === 'SQRT') {
      if (!next || (next.type !== 'NUMBER' && next.type !== 'LPAREN' && next.type !== 'SQRT')) {
        throw new CalculationError('operator without right number');
      }
      // Cannot have number or rparen directly before sqrt without operator (e.g. 3√9)
      if (prev && (prev.type === 'NUMBER' || prev.type === 'RPAREN' || prev.type === 'PERCENT')) {
        throw new CalculationError('bad written operation');
      }
    }

    // Percent token: must have an operand on the left (number or rparen)
    if (token.type === 'PERCENT') {
      if (!prev || (prev.type !== 'NUMBER' && prev.type !== 'RPAREN')) {
        throw new CalculationError('bad written operation');
      }
    }

    // Implicit multiplication like 3(4) or (2)(3) or 3(2+1)
    if (token.type === 'NUMBER' && next && next.type === 'LPAREN') {
      throw new CalculationError('bad written operation');
    }
    if (token.type === 'RPAREN' && next && (next.type === 'LPAREN' || next.type === 'NUMBER')) {
      throw new CalculationError('bad written operation');
    }

    // Empty parenthesis ()
    if (token.type === 'LPAREN' && next && next.type === 'RPAREN') {
      throw new CalculationError('bad written operation');
    }

    // Operator validation
    if (token.type === 'OPERATOR') {
      if (next && next.type === 'OPERATOR') {
        throw new CalculationError('bad written operation');
      }
      // Binary operator at the very start (e.g. '+3', '*3', '/3', '^3')
      if (i === 0 && token.value !== '-') {
        throw new CalculationError('bad written operation');
      }
      // Operator directly after LPAREN (e.g. '(+3)', '(*3)', '(/3)', '(^3)')
      if (prev && prev.type === 'LPAREN' && token.value !== '-') {
        throw new CalculationError('bad written operation');
      }
      // Operator directly before RPAREN (e.g. '(3+)')
      if (next && next.type === 'RPAREN') {
        throw new CalculationError('operator without right number');
      }
    }
  }

  return expression;
}
