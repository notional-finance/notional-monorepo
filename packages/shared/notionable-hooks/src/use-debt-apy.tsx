import { BaseTradeState } from '@notional-finance/notionable';
import { useAllMarkets } from './use-market';

export const useDebtAPY = (state: BaseTradeState) => {
  const { debtOptions, debt } = state;

  const { nonLeveragedYields } = useAllMarkets();
  const debtAPY =
    debtOptions?.find((d) => d.token.id === debt?.id)?.interestRate ||
    nonLeveragedYields.find((y) => y.token.id === debt?.id)?.totalAPY;

  return debtAPY;
};
