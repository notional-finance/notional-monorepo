import { Position } from '../types';

export async function fetchPositions(
  dataServiceUrl: string,
  authToken: string
): Promise<Position[]> {
  const response = await fetch(dataServiceUrl, {
    headers: {
      'x-auth-token': authToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Data service request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // TODO: Adjust this parsing based on actual API response format
  return data as Position[];
}