import { Box, useTheme } from '@mui/material';
import {
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import {
  Body,
  DataTableColumn,
  DisplayCell,
  H5,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import {
  useAllMarkets,
  useFCashMarket,
} from '@notional-finance/notionable-hooks';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { LiquidityContext } from '../../liquidity';
import { useAppState } from '@notional-finance/notionable';

export const useReturnDriversTable = () => {
  const theme = useTheme();
  const {
    state: { deposit, selectedDepositToken, selectedNetwork },
  } = useContext(LiquidityContext);
  const { yields } = useAllMarkets(selectedNetwork);
  const { baseCurrency } = useAppState();
  const fCashData = useFCashMarket(deposit);

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
    const apy =
      fCashData.getSpotInterestRate(balance.token) !== undefined
        ? fCashData.getSpotInterestRate(balance.token)
        : 0;
    return {
      asset: {
        symbol: handleTokenType(balance.tokenType),
        label: formatTokenType(balance.token).titleWithMaturity,
      },
      value: {
        data: [
          {
            displayValue: balance
              .toUnderlying()
              .toDisplayStringWithSymbol(4, true, false),
            isNegative: balance.isNegative(),
          },
          {
            displayValue: balance
              .toUnderlying()
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2),
            isNegative: balance.isNegative(),
          },
        ],
      },
      apy: apy !== undefined ? apy : 0,
    };
  });

  const returnDriversData =
    (formattedFCashData && [
      ...formattedFCashData,
      {
        asset: { symbol: 'trading_fees', label: 'Trading Fees' },
        value: '-',
        apy: liquidityData?.feeAPY || 0,
      },
      {
        asset: { symbol: 'note', label: 'NOTE Incentives' },
        value: '-',
        apy: liquidityData?.noteIncentives?.incentiveAPY || 0,
      },
      {
        asset: { label: 'Total' },
        value: {
          data: [
            {
              displayValue: fCashData
                ?.totalValueLocked(0)
                .toUnderlying()
                .toDisplayString(),
              isNegative: false,
            },
            {
              displayValue: fCashData
                ?.totalValueLocked(0)
                .toUnderlying()
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2),
              isNegative: false,
            },
          ],
        },
        apy: liquidityData?.totalAPY ? liquidityData?.totalAPY : 0,
      },
    ]) ||
    [];

  const returnDriversColumns: DataTableColumn[] = [
    {
      header: (
        <FormattedMessage defaultMessage="Asset" description={'asset header'} />
      ),
      cell: MultiValueIconCell,
      accessorKey: 'asset',
      textAlign: 'left',
    },
    {
      header: (
        <FormattedMessage defaultMessage="Value" description={'value header'} />
      ),
      cell: MultiValueCell,
      accessorKey: 'value',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage defaultMessage="Apy" description={'apy header'} />
      ),
      cell: DisplayCell,
      displayFormatter: formatNumberAsPercent,
      accessorKey: 'apy',
      textAlign: 'right',
    },
  ];

  const infoBoxData = [
    {
      TextComponent: (
        <Box sx={{ marginBottom: theme.spacing(3) }}>
          <H5
            sx={{
              marginBottom: theme.spacing(2),
              color: theme.palette.typography.main,
            }}
          >
            <FormattedMessage
              defaultMessage={'How does n{tokenSymbol} earn returns?'}
              values={{
                tokenSymbol: selectedDepositToken,
              }}
            />
          </H5>
          <Body sx={{ marginBottom: theme.spacing(2) }}>
            <FormattedMessage
              defaultMessage={
                'n{tokenSymbol} earns returns from interest accrual on its assets, trading fees, and NOTE incentives.'
              }
              values={{
                tokenSymbol: selectedDepositToken,
              }}
            />
          </Body>
          <Body sx={{ marginBottom: theme.spacing(2) }}>
            <FormattedMessage
              defaultMessage={
                'n{tokenSymbol} interest accrual comes from variable rate yield on Prime {tokenSymbol} and fixed rate yield on f{tokenSymbol}.'
              }
              values={{
                tokenSymbol: selectedDepositToken,
              }}
            />
          </Body>
        </Box>
      ),
    },
    {
      TextComponent: (
        <Box sx={{ marginBottom: theme.spacing(3) }}>
          <H5
            sx={{
              marginBottom: theme.spacing(2),
              color: theme.palette.typography.main,
            }}
          >
            <FormattedMessage
              defaultMessage={'What is Prime {tokenSymbol}?'}
              values={{
                tokenSymbol: selectedDepositToken,
              }}
            />
          </H5>
          <Body>
            <FormattedMessage
              defaultMessage={
                'Prime {tokenSymbol} is {tokenSymbol} that is being lent on Notional’s variable rate lending market.'
              }
              values={{
                tokenSymbol: selectedDepositToken,
              }}
            />
          </Body>
        </Box>
      ),
    },
    {
      TextComponent: (
        <Box sx={{ marginBottom: theme.spacing(3) }}>
          <H5
            sx={{
              marginBottom: theme.spacing(2),
              color: theme.palette.typography.main,
            }}
          >
            <FormattedMessage
              defaultMessage={'What is f{tokenSymbol}?'}
              values={{
                tokenSymbol: selectedDepositToken,
              }}
            />
          </H5>
          <Body>
            <FormattedMessage
              defaultMessage={
                'f{tokenSymbol} represents a fixed rate lending position. A positive f{tokenSymbol} balance is a loan and a negative f{tokenSymbol} balance is debt.'
              }
              values={{
                tokenSymbol: selectedDepositToken,
              }}
            />
          </Body>
        </Box>
      ),
    },
  ];

  return { returnDriversColumns, returnDriversData, infoBoxData };
};
