const ALLOWED_CHARS_REGEX = /^[0-9.+\-*/()^√%]+$/;

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string | null;
}

export function validateInput(expression: string): ValidationResult {
  if (!expression || expression.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: 'Error: Input bad written'
    };
  }

  // 1. Strict regex gate: numbers, ., +, -, *, /, (, ), ^, √, %
  if (!ALLOWED_CHARS_REGEX.test(expression)) {
    return {
      isValid: false,
      errorMessage: 'Error: Input bad written'
    };
  }

  // 2. Structural syntax check for consecutive operators
  if (
    /\+{2,}|\*{2,}|\/{2,}|\^{2,}|\%{2,}|√{2,}/.test(expression) ||
    /[+*\/^][+*\/^]/.test(expression) ||
    /-[+*\/^]/.test(expression) ||
    /[+*\/^]-{2,}/.test(expression) ||
    /-{3,}/.test(expression) ||
    /\+-/.test(expression) ||
    /-\+/.test(expression) ||
    /%[0-9(√]/.test(expression) || // % followed by number or ( without operator
    /[+*\/^-]%/.test(expression) || // operator directly before % like +%
    /\(%/.test(expression) // (%
  ) {
    return {
      isValid: false,
      errorMessage: 'bad written operation'
    };
  }

  // 3. Parentheses balance
  let openParens = 0;
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];
    if (char === '(') {
      openParens++;
    } else if (char === ')') {
      openParens--;
      if (openParens < 0) {
        return {
          isValid: false,
          errorMessage: 'parenthesis missing'
        };
      }
    }
  }
  if (openParens !== 0) {
    return {
      isValid: false,
      errorMessage: 'parenthesis missing'
    };
  }

  // 4. Operator without right number
  const lastChar = expression[expression.length - 1];
  if (['+', '-', '*', '/', '^', '√'].includes(lastChar)) {
    return {
      isValid: false,
      errorMessage: 'operator without right number'
    };
  }

  // 5. Basic checks: leading operator (except - or √), empty parens (), numbers with multiple dots
  if (['+', '*', '/', '^', '%'].includes(expression[0])) {
    return {
      isValid: false,
      errorMessage: 'bad written operation'
    };
  }

  if (/\(\)/.test(expression)) {
    return {
      isValid: false,
      errorMessage: 'bad written operation'
    };
  }

  // Check implicit multiplication like 3(4) or (2)(3) or 3√9
  if (/\d\(|\)\d|\)\(|[0-9)]√/.test(expression)) {
    return {
      isValid: false,
      errorMessage: 'bad written operation'
    };
  }

  // Check √ directly followed by operator
  if (/√[+*\/^)]/.test(expression)) {
    return {
      isValid: false,
      errorMessage: 'bad written operation'
    };
  }

  // Numbers with multiple dots (e.g. 1.2.3)
  const numberTokens = expression.split(/[+\-*/()^√%]/).filter(Boolean);
  for (const token of numberTokens) {
    const dotCount = (token.match(/\./g) || []).length;
    if (dotCount > 1 || token === '.') {
      return {
        isValid: false,
        errorMessage: 'bad written operation'
      };
    }
  }

  return {
    isValid: true,
    errorMessage: null
  };
}
