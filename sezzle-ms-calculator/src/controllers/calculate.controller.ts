import { Request, Response } from 'express';
import { CalculationRequestBody, CalculationResponseBody } from '../types/calculation';
import { validateExpression } from '../validators/expression';
import { evaluateExpression } from '../services/evaluator';
import { CalculationError } from '../errors/calculationError';

export function calculateController(
  req: Request<unknown, CalculationResponseBody, CalculationRequestBody>,
  res: Response<CalculationResponseBody>
): void {
  const { operation } = req.body;

  try {
    const validatedExpression = validateExpression(operation);
    const result = evaluateExpression(validatedExpression);

    res.status(200).json({
      operation: validatedExpression,
      result,
      error: null
    });
  } catch (err: unknown) {
    if (err instanceof CalculationError) {
      res.status(err.statusCode).json({
        operation: typeof operation === 'string' ? operation : '',
        result: null,
        error: err.message
      });
      return;
    }

    res.status(500).json({
      operation: typeof operation === 'string' ? operation : '',
      result: null,
      error: 'Error: Input bad written'
    });
  }
}
