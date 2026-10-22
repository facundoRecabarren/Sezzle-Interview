export type TokenType = 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'PERCENT' | 'SQRT';

export interface Token {
  type: TokenType;
  value: string;
}

export function tokenize(rawExpression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  const length = rawExpression.length;

  while (index < length) {
    const char = rawExpression[index];

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      index++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      index++;
      continue;
    }

    if (char === '√') {
      tokens.push({ type: 'SQRT', value: '√' });
      index++;
      continue;
    }

    if (char === '%') {
      tokens.push({ type: 'PERCENT', value: '%' });
      index++;
      continue;
    }

    if (char === '+' || char === '*' || char === '/' || char === '^') {
      tokens.push({ type: 'OPERATOR', value: char });
      index++;
      continue;
    }

    if (char === '-') {
      // Check if this '-' is unary or binary operator
      const prevToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
      const isUnary = !prevToken || prevToken.type === 'OPERATOR' || prevToken.type === 'LPAREN' || prevToken.type === 'SQRT';

      if (isUnary) {
        // Look ahead to see if followed directly by a number or decimal point
        const nextChar = rawExpression[index + 1];
        if (nextChar !== undefined && ((nextChar >= '0' && nextChar <= '9') || nextChar === '.')) {
          // Consume number with negative sign
          let numStr = '-';
          index++;
          let dotCount = 0;
          while (index < length) {
            const numChar = rawExpression[index];
            if (numChar >= '0' && numChar <= '9') {
              numStr += numChar;
              index++;
            } else if (numChar === '.') {
              dotCount++;
              numStr += numChar;
              index++;
            } else {
              break;
            }
          }
          if (numStr === '-' || numStr === '-.' || dotCount > 1) {
            tokens.push({ type: 'NUMBER', value: numStr }); // validator will flag bad written operation
          } else {
            tokens.push({ type: 'NUMBER', value: numStr });
          }
          continue;
        }
      }

      tokens.push({ type: 'OPERATOR', value: '-' });
      index++;
      continue;
    }

    // Numbers & decimals
    if ((char >= '0' && char <= '9') || char === '.') {
      let numStr = '';
      while (index < length) {
        const numChar = rawExpression[index];
        if ((numChar >= '0' && numChar <= '9') || numChar === '.') {
          numStr += numChar;
          index++;
        } else {
          break;
        }
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Any unexpected char
    tokens.push({ type: 'OPERATOR', value: char });
    index++;
  }

  return tokens;
}
