import { useState, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  MultiValueIconCell,
  DataTableColumn,
  MultiValueCell,
  DisplayCell,
} from '@notional-finance/mui';
import { TotalEarningsTooltip } from '../components';
import {
  useAccountDefinition,
  useStakedNOTEPoolReady,
  useStakedNoteData,
} from '@notional-finance/notionable-hooks';
import { ExpandedState } from '@tanstack/react-table';
import { useTheme } from '@mui/material';
import { Network, lastValue, PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { formatNumberAsPercentWithUndefined } from '@notional-finance/helpers';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@notional-finance/notionable';

export function usePortfolioSNOTETable() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname: currentPath } = useLocation();
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const account = useAccountDefinition(Network.mainnet);
  const snoteBalance = account?.balances.find((t) => t.symbol === 'sNOTE');
  const isPoolReady = useStakedNOTEPoolReady();
  const stakedNoteData = useStakedNoteData();
  const { baseCurrency } = useAppStore();
  let result: any[] = [];
  const noStakedNoteData = snoteBalance === undefined || snoteBalance.isZero();

  const stakeNoteStatus = account?.stakeNOTEStatus;

  if (isPoolReady && snoteBalance && stakedNoteData) {
    const sNOTEPool = Registry.getExchangeRegistry().getSNOTEPool();
    const currentSNOTEYield = formatNumberAsPercentWithUndefined(
      lastValue(stakedNoteData)?.apy,
      '-',
      2
    );

    const sNOTEPoolData = sNOTEPool?.getCurrentSNOTEClaims(snoteBalance);

    const currentPrice = TokenBalance.unit(snoteBalance.token)
      .toFiat('NOTE')
      .toDisplayStringWithSymbol();

    const sNOTEData = {
      asset: {
        symbol: 'sNOTE',
        symbolSize: 'large',
        symbolBottom: '',
        label: 'sNOTE',
        caption: '80% NOTE, 20% ETH',
      },
      marketApy: currentSNOTEYield,
      noteValue: {
        data: [
          {
            displayValue: sNOTEPoolData?.noteClaim.toDisplayStringWithSymbol(
              2,
              true,
              false
            ),
            isNegative: false,
          },
          {
            displayValue: sNOTEPoolData?.noteClaim
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false),
            isNegative: false,
          },
        ],
      },
      ethValue: {
        data: [
          {
            displayValue: sNOTEPoolData?.ethClaim.toDisplayStringWithSymbol(
              2,
              true,
              false
            ),
            isNegative: false,
          },
          {
            displayValue: sNOTEPoolData?.ethClaim
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false),
            isNegative: false,
          },
        ],
      },
      isDebt: true, // NOTE this is just to make sure the value is note red
      totalValue: snoteBalance
        .toFiat(baseCurrency)
        .toDisplayStringWithSymbol(2, true, false),
      actionRow: {
        stakeNoteStatus: stakeNoteStatus,
        subRowData: [
          {
            label: <FormattedMessage defaultMessage={'Amount'} />,
            value:
              snoteBalance.toDisplayStringWithSymbol(2, true, false) || '-',
          },
          // {
          //   label: <FormattedMessage defaultMessage={'Entry Price'} />,
          //   value: '-',
          // },
          {
            label: <FormattedMessage defaultMessage={'CURRENT PRICE'} />,
            value: `${currentPrice}` || '-',
          },
        ],
        buttonBarData: [
          {
            buttonText: <FormattedMessage defaultMessage={'Unstake'} />,
            callback: () =>
              navigate(`${currentPath}/${PORTFOLIO_ACTIONS.COOL_DOWN}`),
          },
          {
            buttonText: <FormattedMessage defaultMessage={'Stake More'} />,
            callback: () => navigate('/stake/ETH'),
          },
        ],
        txnHistory: ``,
      },
    };
    result = [sNOTEData];
  }

  const Columns = useMemo<DataTableColumn[]>(
    () => [
      {
        header: <FormattedMessage defaultMessage="Asset" />,
        cell: MultiValueIconCell,
        accessorKey: 'asset',
        textAlign: 'left',
        expandableTable: true,
        width: theme.spacing(37.5),
      },
      {
        header: <FormattedMessage defaultMessage="Market APY" />,
        cell: DisplayCell,
        accessorKey: 'marketApy',
        textAlign: 'right',
        expandableTable: true,
        width: theme.spacing(25),
      },
      {
        header: <FormattedMessage defaultMessage="Note Value" />,
        cell: MultiValueCell,
        accessorKey: 'noteValue',
        textAlign: 'right',
        expandableTable: true,
        showLoadingSpinner: true,
        fontWeightBold: true,
      },
      {
        header: <FormattedMessage defaultMessage="ETH Value" />,
        cell: MultiValueCell,
        accessorKey: 'ethValue',
        textAlign: 'right',
        expandableTable: true,
        fontWeightBold: true,
      },
      {
        header: <FormattedMessage defaultMessage="Total Value" />,
        cell: DisplayCell,
        ToolTip: TotalEarningsTooltip,
        accessorKey: 'totalValue',
        textAlign: 'right',
        expandableTable: true,
        fontWeightBold: true,
      },
    ],
    [theme]
  );

  return {
    noStakedNoteData: noStakedNoteData,
    columns: Columns,
    data: result,
    expandedRows,
    setExpandedRows,
    initialState: { expanded: { 0: true }, clickDisabled: true },
  };
}
