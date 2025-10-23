import { Position } from '../types';

export async function fetchPositions(
  hypernativeClientId: string,
  hypernativeClientSecret: string
): Promise<Position[]> {
  const url = 'https://api.hypernative.xyz/lists/6ac143d9-9d99-40f1-b26c-458361c695f3';
  
  console.log('🌐 Making API request to Hypernative positions endpoint');
  
  const response = await fetch(url, {
    headers: {
      'x-client-id': hypernativeClientId,
      'x-client-secret': hypernativeClientSecret,
      'Content-Type': 'application/json',
    },
  });

  console.log(`📡 API response status: ${response.status}`);
  
  if (!response.ok) {
    throw new Error(`Hypernative API request failed: ${response.status} ${response.statusText}`);
  }

  const positionsResult = await response.json() as { data?: { assets?: any[] } };
  
  // Extract positions from the API response format
  const positions = positionsResult.data?.assets || [];
  console.log(`📋 Found ${positions.length} positions`);
  
  // Convert to Position format [accountAddress, vaultAddress]
  const formattedPositions: Position[] = positions.map((asset: any) => {
    try {
      // Parse the note field which contains JSON with account and vault info
      const noteData = JSON.parse(asset.note);
      return [noteData.account, noteData.vault] as Position;
    } catch (error) {
      console.error('Failed to parse asset note:', asset.note, error);
      // Return undefined values if parsing fails
      throw new Error('Failed to parse asset note');
    }
  }).filter((position: Position) => position[0] && position[1]); // Filter out invalid positions
  
  return formattedPositions;
}