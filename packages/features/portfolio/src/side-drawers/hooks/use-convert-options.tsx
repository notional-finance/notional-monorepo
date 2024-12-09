import {
  useCurrentTradeContext,
  usePortfolioRiskProfile,
  usePrimeTokens,
} from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router';

export function useConvertOptions() {
  const trade = useCurrentTradeContext();
  const { debt: debtOptions, collateral: collateralOptions } =
    trade?.computedOptions ?? {};
  const tradeType = trade?.tradeType;
  const selectedNetwork = trade?.selectedNetwork;

  const portfolio = usePortfolioRiskProfile(selectedNetwork);
  const primeTokens = usePrimeTokens();
  const { selectedToken: selectedParamToken } = useParams<{
    selectedToken: string;
  }>();
  const isPrimeDebt = primeTokens?.primeDebt.find(
    (t) => t.id === selectedParamToken
  );
  const selectedToken = isPrimeDebt
    ? primeTokens?.primeCash.find(
        (t) => t.currencyId === isPrimeDebt.currencyId
      )?.id
    : selectedParamToken;

  let initialConvertFromBalance = portfolio?.balances.find(
    (t) => t.tokenId === selectedToken
  );

  let options = tradeType === 'ConvertAsset' ? collateralOptions : debtOptions;

  if (
    initialConvertFromBalance?.isPositive() &&
    initialConvertFromBalance.tokenType === 'PrimeCash' &&
    tradeType === 'ConvertAsset'
  ) {
    initialConvertFromBalance = initialConvertFromBalance.toPrimeDebt();
    options = options?.filter((t) => t.token.tokenType !== 'PrimeCash');
  } else if (
    initialConvertFromBalance?.isNegative() &&
    initialConvertFromBalance.tokenType === 'PrimeCash' &&
    tradeType === 'RollDebt'
  ) {
    initialConvertFromBalance = initialConvertFromBalance.toPrimeCash();
    options = options?.filter((t) => t.token.tokenType !== 'PrimeDebt');
  }

  return {
    options,
    initialConvertFromBalance,
  };
}
