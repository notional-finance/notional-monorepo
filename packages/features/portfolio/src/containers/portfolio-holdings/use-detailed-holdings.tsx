import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { TokenBalance } from '@notional-finance/core-entities';
import {
  formatTokenType,
  formatNumberAsPercent,
  formatCryptoWithFiat,
  formatNumberAsPercentWithUndefined,
} from '@notional-finance/helpers';
import {
  useFiat,
  useFiatToken,
  useHoldings,
  useNOTE,
} from '@notional-finance/notionable-hooks';
import { PORTFOLIO_ACTIONS, TXN_HISTORY_TYPE } from '@notional-finance/util';

export function useDetailedHoldings() {
  const holdings = useHoldings();
  const history = useHistory();
  const baseCurrency = useFiat();
  const fiatToken = useFiatToken();
  const NOTE = useNOTE();

  return useMemo(() => {
    const totals = holdings.reduce(
      (t, { balance, statement }) => {
        if (statement) {
          t.amountPaid = t.amountPaid.add(
            statement.accumulatedCostRealized.toFiat(baseCurrency)
          );
          t.presentValue = t.presentValue.add(balance.toFiat(baseCurrency));
          t.earnings = t.earnings.add(
            statement.totalProfitAndLoss.toFiat(baseCurrency)
          );
        }
        return t;
      },
      {
        amountPaid: TokenBalance.zero(fiatToken),
        presentValue: TokenBalance.zero(fiatToken),
        earnings: TokenBalance.zero(fiatToken),
      }
    );

    const detailedHoldings = holdings.map(
      ({
        balance: b,
        statement: s,
        marketYield,
        isPending,
        maturedTokenId,
        manageTokenId,
      }) => {
        const isDebt = b.isNegative();
        const { icon, formattedTitle, title } = formatTokenType(
          b.token,
          isDebt
        );
        const marketApy = marketYield?.totalAPY;
        const noteIncentives = marketYield?.incentives?.find(
          ({ tokenId }) => tokenId === NOTE?.id
        );

        return {
          tokenId: b.tokenId,
          pendingTokenData: isPending ? b.token : undefined,
          asset: {
            symbol: icon,
            symbolBottom: '',
            label: formattedTitle ? formattedTitle : title,
            caption: title,
          },
          marketApy: {
            data: [
              {
                displayValue: formatNumberAsPercentWithUndefined(
                  marketApy,
                  '-',
                  2
                ),
                isNegative: marketApy !== undefined && marketApy < 0,
              },
              {
                displayValue: noteIncentives
                  ? `${formatNumberAsPercent(
                      noteIncentives?.incentiveAPY
                    )} NOTE`
                  : b.token.tokenType === 'fCash' &&
                    s?.impliedFixedRate !== undefined
                  ? `${formatNumberAsPercent(
                      s.impliedFixedRate
                    )} APY at Maturity`
                  : '',
                isNegative: false,
              },
            ],
          },
          amountPaid: s
            ? formatCryptoWithFiat(baseCurrency, s.accumulatedCostRealized)
            : '-',
          presentValue: formatCryptoWithFiat(baseCurrency, b.toUnderlying()),
          earnings: s
            ? s.totalProfitAndLoss
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(3, true)
            : '-',
          actionRow: {
            subRowData: [
              {
                label: <FormattedMessage defaultMessage={'Amount'} />,
                value: `${b.toDisplayString(3, true)} ${title}`,
              },
              {
                label: <FormattedMessage defaultMessage={'Entry Price'} />,
                value: s
                  ? s.adjustedCostBasis.toDisplayStringWithSymbol(3)
                  : '-',
                // ? why doesnt this just show conditionally?
                showLoadingSpinner: true,
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
                      ? `/portfolio/holdings/${PORTFOLIO_ACTIONS.CONVERT_ASSET}/${manageTokenId}`
                      : `/portfolio/holdings/${PORTFOLIO_ACTIONS.ROLL_DEBT}/${manageTokenId}`
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
                        `/portfolio/holdings/${PORTFOLIO_ACTIONS.WITHDRAW}/${maturedTokenId}`
                      );
                    },
                  }
                : {
                    buttonText: <FormattedMessage defaultMessage={'Repay'} />,
                    callback: () => {
                      history.push(
                        `/portfolio/holdings/${PORTFOLIO_ACTIONS.REPAY_DEBT}/${maturedTokenId}`
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
      }
    ) as any[];

    detailedHoldings.push({
      asset: {
        symbol: '',
        symbolBottom: '',
        label: 'Total',
        caption: '',
      },
      marketApy: {
        data: [
          {
            displayValue: '',
            isNegative: false,
          },
        ],
      },
      amountPaid: totals.amountPaid.toDisplayStringWithSymbol(),
      presentValue: totals.presentValue.toDisplayStringWithSymbol(),
      earnings: totals.earnings.toDisplayStringWithSymbol(),
      actionRow: undefined,
      tokenId: ' ',
      isTotalRow: true,
    });

    return { detailedHoldings, totals };
  }, [holdings, baseCurrency, history, fiatToken, NOTE]);
}
