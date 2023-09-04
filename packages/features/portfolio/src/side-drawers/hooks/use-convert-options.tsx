import { BaseTradeState } from '@notional-finance/notionable';
import { useAccountDefinition } from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router';

export function useConvertOptions(state: BaseTradeState) {
  const { tradeType, collateralOptions, debtOptions } = state;
  const { account } = useAccountDefinition();
  const { selectedToken: selectedParamToken } = useParams<{
    selectedToken: string;
  }>();

  let initialConvertFromBalance = account?.balances.find(
    (t) => t.tokenId === selectedParamToken
  );

  let options = tradeType === 'ConvertAsset' ? collateralOptions : debtOptions;

  if (initialConvertFromBalance?.tokenType === 'PrimeCash') {
    initialConvertFromBalance = initialConvertFromBalance.toPrimeDebt();
    options = options?.filter((t) => t.token.tokenType !== 'PrimeCash');
  } else if (initialConvertFromBalance?.tokenType === 'PrimeDebt') {
    initialConvertFromBalance = initialConvertFromBalance.toPrimeCash();
    options = options?.filter((t) => t.token.tokenType !== 'PrimeDebt');
  }

  return {
    options,
    initialConvertFromBalance,
  };
}
