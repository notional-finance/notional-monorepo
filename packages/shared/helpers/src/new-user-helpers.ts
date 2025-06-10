export const getBoostedData = (data: any[]) => {
  const newUserBoostedData = data.filter(
    (data) => data.symbol === 'ETH' || data.symbol === 'USDC'
  );
  const nonBoostedData = data.filter(
    (data) => data.symbol !== 'ETH' && data.symbol !== 'USDC'
  );

  return {
    newUserBoostedData,
    nonBoostedData,
  };
};

export const checkStarterBoostToken = (
  symbol: string,
  isStarterBoostUser: boolean
) => {
  return (symbol === 'ETH' || symbol === 'USDC') && isStarterBoostUser;
};

export const fetchNewcomerBoostData = async () => {
  try {
    const response = await fetch(
      'https://registry.notional.finance/newcomer-boost.json'
    );
    if (!response.ok) {
      throw new Error('Failed to fetch newcomer boost data');
    }
    return response.json() as Promise<string[]>;
  } catch (error) {
    console.error('Error fetching newcomer boost data:', error);
    return null;
  }
};
