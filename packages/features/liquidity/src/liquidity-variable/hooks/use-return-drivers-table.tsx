import { useContext } from 'react';
import {
  useFCashMarket,
  useAllMarkets,
  useFiat,
} from '@notional-finance/notionable-hooks';
import { LiquidityContext } from '../liquidity-variable';
import {
  formatTokenType,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
  DisplayCell,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const useReturnDriversTable = () => {
  const {
    state: { deposit, selectedDepositToken },
  } = useContext(LiquidityContext);
  const { yields } = useAllMarkets();
  const baseCurrency = useFiat();
  const fCashData = useFCashMarket(deposit?.currencyId);

  const liquidityData = yields.liquidity.find(
    ({ underlying }) => underlying.symbol === selectedDepositToken
  );

  const handleTokenType = (tokenType: string | undefined) => {
    if (tokenType === 'fCash') {
      return `f${selectedDepositToken}`;
    }
    if (tokenType === 'PrimeCash') {
      return `p${selectedDepositToken}`;
    }
    return selectedDepositToken;
  };

  const formattedFCashData = fCashData?.balances?.map((balance) => {
    const apy = fCashData.getSpotInterestRate(balance.token) || 0;
    return {
      asset: {
        symbol: handleTokenType(balance.tokenType),
        label: formatTokenType(balance.token).titleWithMaturity,
      },
      value: {
        data: [
          balance.toUnderlying().toDisplayString(),
          balance
            .toUnderlying()
            .toFiat(baseCurrency)
            .toDisplayStringWithSymbol(),
        ],
        isNegative: balance.isNegative(),
      },
      apy: apy !== 0 ? formatNumberAsPercent(apy) : '-',
    };
  });

  const returnDriversData =
    (formattedFCashData && [
      ...formattedFCashData,
      {
        asset: { symbol: 'trading_fees', label: 'Trading Fees' },
        value: '-',
        apy: liquidityData?.feeAPY,
      },
      {
        asset: { symbol: 'note', label: 'NOTE Incentives' },
        value: '-',
        apy:
          liquidityData && liquidityData?.incentives
            ? formatNumberAsPercent(liquidityData?.incentives[0].incentiveAPY)
            : '-',
      },
      {
        asset: { label: 'Total' },
        value: {
          data: [
            fCashData?.totalValueLocked(0).toUnderlying().toDisplayString(),
            fCashData
              ?.totalValueLocked(0)
              .toUnderlying()
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(),
          ],
          isNegative: false,
        },
        apy: liquidityData?.totalAPY
          ? formatNumberAsPercent(liquidityData?.totalAPY)
          : '-',
      },
    ]) ||
    [];

  const returnDriversColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage defaultMessage="Asset" description={'asset header'} />
      ),
      Cell: MultiValueIconCell,
      accessor: 'asset',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="Value" description={'value header'} />
      ),
      Cell: MultiValueCell,
      accessor: 'value',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="Apy" description={'apy header'} />
      ),
      Cell: DisplayCell,
      accessor: 'apy',
      textAlign: 'right',
    },
  ];

  console.log({ formattedFCashData });

  return { returnDriversColumns, returnDriversData };
};
