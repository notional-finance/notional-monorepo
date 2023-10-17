import { BaseTradeState } from '@notional-finance/notionable';
import { useAllMarkets } from './use-market';
import { TokenDefinition } from '@notional-finance/core-entities';

export const useDebtAPY = (
  state: BaseTradeState,
  debtOverride?: TokenDefinition
) => {
  const { debtOptions, debt } = state;

  const { nonLeveragedYields } = useAllMarkets();
  const debtAPY =
    debtOptions?.find((d) => d.token.id === (debtOverride?.id || debt?.id))
      ?.interestRate ||
    nonLeveragedYields.find(
      (y) => y.token.id === (debtOverride?.id || debt?.id)
    )?.totalAPY;

  return debtAPY;
};
