export class CalculationError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'CalculationError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CalculationError.prototype);
  }
}
