import { useState, useEffect, useMemo } from 'react';
import { TokenBalance } from '@notional-finance/core-entities';
import {
  formatCryptoWithFiat,
  formatNumberAsPercent,
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
  useAllMarkets,
  useBalanceStatements,
} from '@notional-finance/notionable-hooks';

export function usePortfolioHoldings() {
  const history = useHistory();
  const balanceStatements = useBalanceStatements();
  const [expandedRows, setExpandedRows] = useState<ExpandedRows | null>(null);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const { allYields } = useAllMarkets();

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
    balanceStatements
      .filter(
        (b) =>
          !b.currentBalance.isZero() &&
          !b.currentBalance.isVaultToken &&
          b.token.tokenType !== 'Underlying' &&
          b.token.tokenType !== 'NOTE'
      )

      .map((b) => {
        return {
          asset: {
            symbol: b.underlying.symbol,
            label: b.token.symbol,
            caption:
              b.token.tokenType === 'fCash' && b.impliedFixedRate !== undefined
                ? `${formatNumberAsPercent(b.impliedFixedRate)} APY at Maturity`
                : undefined,
          },
          // TODO: this has a caption for note incentives
          marketApy: formatNumberAsPercent(
            allYields.find(
              (y) => y.token.id === b.token.id && y.leveraged === undefined
            )?.totalAPY || 0
          ),
          amountPaid: formatCryptoWithFiat(b.accumulatedCostRealized),
          presentValue: formatCryptoWithFiat(b.currentBalance.toUnderlying()),
          earnings: b.totalProfitAndLoss
            .toFiat('USD')
            .toDisplayStringWithSymbol(),
          actionRow: {
            subRowData: [
              {
                label: <FormattedMessage defaultMessage={'Amount'} />,
                value: b.currentBalance.toDisplayString(3, true),
              },
              {
                label: <FormattedMessage defaultMessage={'Entry Price'} />,
                value: b.adjustedCostBasis.toDisplayStringWithSymbol(3),
              },
              {
                label: <FormattedMessage defaultMessage={'Current Price'} />,
                value: TokenBalance.unit(b.token)
                  .toUnderlying()
                  .toDisplayStringWithSymbol(3),
              },
            ],
            buttonBarData: [
              {
                buttonText: <FormattedMessage defaultMessage={'Manage'} />,
                callback: () => {
                  history.push(
                    b.currentBalance.isPositive()
                      ? `/portfolio/holdings/${PORTFOLIO_ACTIONS.CONVERT_ASSET}/${b.token.id}`
                      : `/portfolio/holdings/${PORTFOLIO_ACTIONS.ROLL_DEBT}/${b.token.id}`
                  );
                },
              },
              b.currentBalance.isPositive()
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
