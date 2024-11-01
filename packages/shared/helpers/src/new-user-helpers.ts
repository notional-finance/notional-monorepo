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
