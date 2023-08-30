import { BaseTradeState } from '@notional-finance/notionable';
import {
  useAccountDefinition,
  useCurrency,
} from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router';

export function useConvertOptions(state: BaseTradeState) {
  const { tradeType, collateralOptions, debtOptions } = state;
  const { account } = useAccountDefinition();
  const { primeDebt } = useCurrency();
  const { selectedToken: selectedParamToken } = useParams<{
    selectedToken: string;
  }>();

  let initialConvertFromBalance = account?.balances.find(
    (t) => t.tokenId === selectedParamToken
  );

  let options = tradeType === 'ConvertAsset' ? collateralOptions : debtOptions;

  if (initialConvertFromBalance?.tokenType === 'PrimeCash') {
    const pDebt = primeDebt.find(
      (t) => t.currencyId === initialConvertFromBalance?.currencyId
    );
    if (!pDebt) throw Error('Prime Debt not found');
    initialConvertFromBalance = initialConvertFromBalance.toToken(pDebt);
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
