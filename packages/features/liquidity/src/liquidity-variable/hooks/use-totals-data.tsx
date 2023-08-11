import { useAllMarkets } from '@notional-finance/notionable-hooks';
export const useTotalsData = () => {
  const data = useAllMarkets();
  console.log({ data });
};

export default useTotalsData;
