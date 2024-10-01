import { FormattedMessage } from 'react-intl';
import {
  FiatKeys,
  TokenBalance,
  FiatSymbols,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { useTotalHolders } from '@notional-finance/notionable-hooks';
import { useCurrentNetworkStore } from '@notional-finance/notionable';

export const useTotalsData = (
  deposit: TokenDefinition | undefined,
  debt: TokenDefinition | undefined,
  baseCurrency: FiatKeys
) => {
  const currentNetworkStore = useCurrentNetworkStore();
  const fCashBorrow = currentNetworkStore.getAllFCashDebt();
  const totalBorrowers = useTotalHolders(debt);
  const liquidity = fCashBorrow.find(({ token }) => token.id === debt?.id);

  let totalFixedRateDebt;
  if (deposit) {
    const zeroUnderlying = TokenBalance.fromFloat(0, deposit);
    totalFixedRateDebt = fCashBorrow
      .filter((data) => data?.underlying?.id === deposit.id)
      .map(({ token }) => token.totalSupply?.toUnderlying())
      .reduce((sum, balance) => {
        return balance && sum ? sum?.add(balance) : sum;
      }, zeroUnderlying);
  }

  return [
    {
      title: <FormattedMessage defaultMessage={'TVL'} />,
      value: liquidity?.liquidity?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: <FormattedMessage defaultMessage={'Total Fixed Rate Debt'} />,
      value: totalFixedRateDebt?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Borrowers'} />,
      value: totalBorrowers ? `${totalBorrowers}` : '-',
    },
  ];
};

export default useTotalsData;
