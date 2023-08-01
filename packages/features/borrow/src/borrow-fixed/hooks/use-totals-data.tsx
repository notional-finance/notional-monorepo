import { FormattedMessage } from 'react-intl';
import { TokenBalance } from '@notional-finance/core-entities';
import {
  useAllMarkets,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';

export const useTotalsData = (selectedDepositToken: string | undefined) => {
  const network = useSelectedNetwork();
  const data = useAllMarkets();
  const {
    yields: { fCashBorrow, liquidity },
  } = data;
  let tvlData: any = null;

  if (liquidity) {
    tvlData = liquidity.find(
      (data) => data.underlying?.symbol === selectedDepositToken
    );
  }

  const filteredFCash = fCashBorrow

    .filter(({ underlying }) => underlying?.symbol === selectedDepositToken)
    .map(({ token }) => token.totalSupply?.toUnderlying());

  let totalFixedRateDebt;
  if (filteredFCash && selectedDepositToken && network) {
    const zeroUnderlying = TokenBalance.fromSymbol(
      0,
      selectedDepositToken,
      network
    );

    totalFixedRateDebt = filteredFCash?.reduce((sum, balance) => {
      return balance && sum ? sum?.add(balance) : sum;
    }, zeroUnderlying);
  }

  return [
    {
      title: <FormattedMessage defaultMessage={'TVL'} />,
      value: tvlData?.tvl?.toFiat('USD').toDisplayStringWithSymbol() || '-',
    },
    {
      title: <FormattedMessage defaultMessage={'Total Fixed Rate Debt'} />,
      value:
        totalFixedRateDebt?.toFiat('USD').toDisplayStringWithSymbol() || '-',
    },
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Borrowers'} />,
      value: '-',
    },
  ];
};

export default useTotalsData;
