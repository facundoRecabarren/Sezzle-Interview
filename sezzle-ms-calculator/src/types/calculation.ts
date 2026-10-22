export interface CalculationRequestBody {
  operation?: unknown;
}

export interface CalculationResponseBody {
  operation: string;
  result: number | null;
  error: string | null;
}
