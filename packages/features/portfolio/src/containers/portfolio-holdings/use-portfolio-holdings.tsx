import { useState, useEffect, useMemo } from 'react';
import { TokenBalance } from '@notional-finance/core-entities';
import {
  formatCryptoWithFiat,
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import {
  TXN_HISTORY_TYPE,
  PORTFOLIO_ACTIONS,
} from '@notional-finance/shared-config';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
  DataTableColumn,
  MultiValueIconCell,
  MultiValueCell,
  DisplayCell,
  ExpandedRows,
  ChevronCell,
} from '@notional-finance/mui';
import {
  useFiat,
  useAccountDefinition,
  useAllMarkets,
  useBalanceStatements,
} from '@notional-finance/notionable-hooks';
import { convertToSignedfCashId } from '@notional-finance/util';

export function usePortfolioHoldings() {
  const baseCurrency = useFiat();
  const history = useHistory();
  const { account } = useAccountDefinition();
  const balanceStatements = useBalanceStatements();
  const [expandedRows, setExpandedRows] = useState<ExpandedRows | null>(null);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const { nonLeveragedYields } = useAllMarkets();

  const portfolioHoldingsColumns: DataTableColumn[] = useMemo(() => {
    return [
      {
        Header: <FormattedMessage defaultMessage="Asset" />,
        Cell: MultiValueIconCell,
        accessor: 'asset',
        textAlign: 'left',
        expandableTable: true,
      },
      {
        Header: <FormattedMessage defaultMessage="Market APY" />,
        Cell: DisplayCell,
        accessor: 'marketApy',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        Header: <FormattedMessage defaultMessage="Amount Paid" />,
        Cell: MultiValueCell,
        accessor: 'amountPaid',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        Header: <FormattedMessage defaultMessage="Present Value" />,
        Cell: MultiValueCell,
        accessor: 'presentValue',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        Header: <FormattedMessage defaultMessage="Total Earnings" />,
        Cell: DisplayCell,
        accessor: 'earnings',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        Header: '',
        Cell: ChevronCell,
        accessor: 'chevron',
        textAlign: 'left',
        expandableTable: true,
      },
    ];
  }, []);

  const portfolioHoldingsData =
    account?.balances
      .filter(
        (b) =>
          !b.isZero() &&
          !b.isVaultToken &&
          b.token.tokenType !== 'Underlying' &&
          b.token.tokenType !== 'NOTE'
      )
      .map((b) => {
        const { titleWithMaturity, icon } = formatTokenType(b.token);
        const s = balanceStatements.find(
          (s) =>
            s.token.id === convertToSignedfCashId(b.tokenId, b.isNegative())
        );
        return {
          asset: {
            symbol: icon,
            label: titleWithMaturity,
            caption:
              b.token.tokenType === 'fCash' && s?.impliedFixedRate !== undefined
                ? `${formatNumberAsPercent(s.impliedFixedRate)} APY at Maturity`
                : undefined,
          },
          // TODO: this has a caption for note incentives
          marketApy: formatNumberAsPercent(
            nonLeveragedYields.find((y) => y.token.id === b.token.id)
              ?.totalAPY || 0
          ),
          amountPaid: s
            ? formatCryptoWithFiat(baseCurrency, s.accumulatedCostRealized)
            : '-',
          presentValue: formatCryptoWithFiat(baseCurrency, b.toUnderlying()),
          earnings: s
            ? s.totalProfitAndLoss
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol()
            : '-',
          actionRow: {
            subRowData: [
              {
                label: <FormattedMessage defaultMessage={'Amount'} />,
                value: b.toDisplayString(3, true),
              },
              {
                label: <FormattedMessage defaultMessage={'Entry Price'} />,
                value: s
                  ? s.adjustedCostBasis.toDisplayStringWithSymbol(3)
                  : '-',
              },
              {
                label: <FormattedMessage defaultMessage={'Current Price'} />,
                value: `${TokenBalance.unit(b.token)
                  .toUnderlying()
                  .toDisplayString(3)} ${b.underlying.symbol}`,
              },
            ],
            buttonBarData: [
              {
                buttonText: <FormattedMessage defaultMessage={'Manage'} />,
                callback: () => {
                  history.push(
                    b.isPositive()
                      ? `/portfolio/holdings/${PORTFOLIO_ACTIONS.CONVERT_ASSET}/${b.token.id}`
                      : `/portfolio/holdings/${PORTFOLIO_ACTIONS.ROLL_DEBT}/${b.token.id}`
                  );
                },
              },
              b.isPositive()
                ? {
                    buttonText: (
                      <FormattedMessage defaultMessage={'Withdraw'} />
                    ),
                    callback: () => {
                      history.push(
                        `/portfolio/holdings/${PORTFOLIO_ACTIONS.WITHDRAW}/${b.token.id}`
                      );
                    },
                  }
                : {
                    buttonText: <FormattedMessage defaultMessage={'Repay'} />,
                    callback: () => {
                      history.push(
                        `/portfolio/holdings/${PORTFOLIO_ACTIONS.REPAY_DEBT}/${b.token.id}`
                      );
                    },
                  },
            ],
            txnHistory: `/portfolio/transaction-history?${new URLSearchParams({
              txnHistoryType: TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS,
              assetOrVaultId: b.token.id,
            })}`,
          },
        };
      }) || [];

  useEffect(() => {
    const formattedExpandedRows = portfolioHoldingsColumns.reduce(
      (accumulator, _value, index) => {
        return { ...accumulator, [index]: index === 0 ? true : false };
      },
      {}
    );

    if (
      expandedRows === null &&
      JSON.stringify(formattedExpandedRows) !== '{}'
    ) {
      setExpandedRows(formattedExpandedRows);
    }
  }, [portfolioHoldingsColumns, expandedRows, setExpandedRows]);

  return {
    portfolioHoldingsColumns,
    portfolioHoldingsData,
    setExpandedRows,
    initialState,
  };
}
