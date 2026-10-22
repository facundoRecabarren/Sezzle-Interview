export type Theme = 'dark' | 'light';

export interface CalculationResponseBody {
  operation: string;
  result: number | null;
  error: string | null;
}
