import type { CalculationResponseBody } from '../types/calculation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function calculateApi(operation: string): Promise<CalculationResponseBody> {
  const url = `${API_BASE_URL}/v1/calculate`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ operation })
    });
  } catch (err: unknown) {
    throw new Error('Network error: Unable to reach calculator service.');
  }

  const data = (await response.json()) as CalculationResponseBody;

  if (!response.ok) {
    throw new Error(data.error || `Server error: ${response.status}`);
  }

  return data;
}
