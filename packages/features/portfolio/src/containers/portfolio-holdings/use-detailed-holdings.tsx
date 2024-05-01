import { TokenBalance } from '@notional-finance/core-entities';
import {
  formatCryptoWithFiat,
  formatNumberAsPercent,
  formatNumberAsPercentWithUndefined,
  formatTokenType,
  getHoldingsSortOrder,
} from '@notional-finance/helpers';
import {
  useFiat,
  useFiatToken,
  useNOTE,
  usePendingPnLCalculation,
  usePortfolioHoldings,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import {
  Network,
  PORTFOLIO_ACTIONS,
  TXN_HISTORY_TYPE,
} from '@notional-finance/util';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

export function useDetailedHoldingsTable() {
  const network = useSelectedNetwork();
  const holdings = usePortfolioHoldings(network);
  const pendingTokens = usePendingPnLCalculation(network).flatMap(
    ({ tokens }) => tokens
  );
  const history = useHistory();
  const baseCurrency = useFiat();
  const fiatToken = useFiatToken();
  const NOTE = useNOTE(network);

  return useMemo(() => {
    const totals = holdings.reduce(
      (t, { balance, statement, totalIncentiveEarnings }) => {
        const totalEarningsWithNOTE = statement?.totalProfitAndLoss
          .toFiat(baseCurrency)
          .add(
            totalIncentiveEarnings.reduce(
              (s, i) => s.add(i.toFiat(baseCurrency)),
              TokenBalance.fromSymbol(0, baseCurrency, Network.all)
            )
          );

        if (statement) {
          t.amountPaid = t.amountPaid.add(
            statement.accumulatedCostRealized.toFiat(baseCurrency)
          );
          t.presentValue = t.presentValue.add(balance.toFiat(baseCurrency));
          t.earnings = totalEarningsWithNOTE
            ? t.earnings.add(totalEarningsWithNOTE.toFiat(baseCurrency))
            : t.earnings.add(statement.totalProfitAndLoss.toFiat(baseCurrency));
          t.nonNoteEarnings = t.nonNoteEarnings.add(
            statement.totalProfitAndLoss.toFiat(baseCurrency)
          );
          const totalNOTEEarnings = totalIncentiveEarnings.find(
            (t) => t.symbol === 'NOTE'
          );
          t.noteEarnings = totalNOTEEarnings
            ? t?.noteEarnings?.add(totalNOTEEarnings)
            : t.noteEarnings;

          totalIncentiveEarnings.forEach((data) => {
            const currentTokenBalance = t.totalIncentiveEarnings.findIndex(
              (t) => t.symbol === data.symbol
            );
            if (currentTokenBalance > -1) {
              t.totalIncentiveEarnings[currentTokenBalance] =
                t.totalIncentiveEarnings[currentTokenBalance].add(data);
            } else {
              t.totalIncentiveEarnings.push(data);
            }
          });
        }
        return t;
      },
      {
        amountPaid: TokenBalance.zero(fiatToken),
        presentValue: TokenBalance.zero(fiatToken),
        earnings: TokenBalance.zero(fiatToken),
        nonNoteEarnings: TokenBalance.zero(fiatToken),
        totalIncentiveEarnings: [] as TokenBalance[],
        noteEarnings: NOTE ? TokenBalance.zero(NOTE) : undefined,
      }
    );

    const detailedHoldings = holdings
      .map(
        ({
          balance: b,
          statement: s,
          marketYield,
          maturedTokenId,
          manageTokenId,
          totalIncentiveEarnings,
          hasMatured,
          isHighUtilization,
          hasNToken,
        }) => {
          const isDebt = b.isNegative();
          const { icon, formattedTitle, titleWithMaturity, title } =
            formatTokenType(b.token, isDebt);
          const marketApy = marketYield?.totalAPY;
          const noteIncentives = marketYield?.noteIncentives?.incentiveAPY;
          const secondaryIncentives =
            marketYield?.secondaryIncentives?.incentiveAPY;
          const secondarySymbol = marketYield?.secondaryIncentives?.symbol;

          const totalEarningsWithNOTE = s?.totalProfitAndLoss
            .toFiat(baseCurrency)
            .add(
              totalIncentiveEarnings.reduce(
                (s, i) => s.add(i.toFiat(baseCurrency)),
                TokenBalance.fromSymbol(0, baseCurrency, Network.all)
              )
            );

          const buttonBarData: {
            buttonText: React.ReactNode;
            callback: () => void;
          }[] = [];

          if (hasNToken) {
            buttonBarData.push({
              buttonText: <FormattedMessage defaultMessage={'Manage'} />,
              callback: () => {
                history.push(
                  b.isPositive()
                    ? `/portfolio/${network}/holdings/${PORTFOLIO_ACTIONS.CONVERT_ASSET}/${manageTokenId}/manage`
                    : `/portfolio/${network}/holdings/${PORTFOLIO_ACTIONS.ROLL_DEBT}/${manageTokenId}/manage`
                );
              },
            });
          }

          if (b.isPositive()) {
            buttonBarData.push({
              buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
              callback: () => {
                history.push(
                  `/portfolio/${network}/holdings/${
                    PORTFOLIO_ACTIONS.WITHDRAW
                  }/${maturedTokenId}${
                    isHighUtilization ? `?warning=${isHighUtilization}` : ''
                  }`
                );
              },
            });
          } else {
            buttonBarData.push({
              buttonText: <FormattedMessage defaultMessage={'Repay'} />,
              callback: () => {
                history.push(
                  `/portfolio/${network}/holdings/${PORTFOLIO_ACTIONS.REPAY_DEBT}/${maturedTokenId}`
                );
              },
            });
          }

          return {
            sortOrder: getHoldingsSortOrder(b.token),
            tokenId: b.tokenId,
            isPending: !!pendingTokens.find((t) => t.id === b.tokenId),
            asset: {
              symbol: icon,
              symbolBottom: '',
              label: formattedTitle,
              caption: titleWithMaturity,
            },
            marketApy: {
              data: [
                {
                  displayValue: formatNumberAsPercentWithUndefined(
                    marketApy,
                    '-',
                    2
                  ),
                  isNegative: false,
                },
                {
                  displayValue:
                    noteIncentives && secondaryIncentives
                      ? `${formatNumberAsPercent(
                          noteIncentives
                        )} NOTE, ${formatNumberAsPercent(
                          secondaryIncentives
                        )} ${secondarySymbol}`
                      : noteIncentives
                      ? `${formatNumberAsPercent(noteIncentives)} NOTE`
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
            isDebt: isDebt,
            earnings:
              totalEarningsWithNOTE?.toDisplayStringWithSymbol(
                2,
                true,
                true,
                'en-US',
                true
              ) || '-',
            toolTipData:
              totalIncentiveEarnings.length > 0
                ? {
                    perAssetEarnings: [
                      {
                        underlying:
                          s?.totalProfitAndLoss.toDisplayStringWithSymbol(),
                        baseCurrency: s?.totalProfitAndLoss
                          .toFiat(baseCurrency)
                          .toDisplayStringWithSymbol(2),
                      },
                      ...totalIncentiveEarnings.map((i) => ({
                        underlying: i.toDisplayStringWithSymbol(),
                        baseCurrency: i
                          .toFiat(baseCurrency)
                          .toDisplayStringWithSymbol(2),
                      })),
                    ],
                  }
                : undefined,
            actionRow: {
              warning: isHighUtilization,
              subRowData: [
                {
                  label: <FormattedMessage defaultMessage={'Amount'} />,
                  value: `${b.toDisplayString(4, true)} ${title}`,
                },
                {
                  label: <FormattedMessage defaultMessage={'Entry Price'} />,
                  value: s
                    ? s.adjustedCostBasis.toDisplayStringWithSymbol()
                    : '-',
                  // ? why doesnt this just show conditionally?
                  showLoadingSpinner: true,
                },
                {
                  label: <FormattedMessage defaultMessage={'Current Price'} />,
                  value: `${TokenBalance.unit(b.token)
                    .toUnderlying()
                    .toDisplayString(4)} ${b.underlying.symbol}`,
                },
              ],
              buttonBarData,
              hasMatured: hasMatured,
              txnHistory: `/portfolio/${network}/transaction-history?${new URLSearchParams(
                {
                  txnHistoryType: TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS,
                  assetOrVaultId: b.token.id,
                }
              )}`,
            },
          };
        }
      )
      .sort((a, b) => {
        if (a.isDebt && !b.isDebt) {
          return 1;
        }
        if (!a.isDebt && b.isDebt) {
          return -1;
        }
        return 0;
      });

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
      amountPaid: totals.amountPaid.toDisplayStringWithSymbol(2),
      presentValue: totals.presentValue.toDisplayStringWithSymbol(2),
      earnings: totals.earnings.toDisplayStringWithSymbol(
        2,
        true,
        true,
        'en-US',
        true
      ),
      toolTipData:
        totals.totalIncentiveEarnings.length > 0
          ? {
              totalEarnings: [
                {
                  value: totals.nonNoteEarnings
                    .toFiat(baseCurrency)
                    .toDisplayStringWithSymbol(2),
                  symbol: 'ORGANIC',
                },
                ...totals.totalIncentiveEarnings.map((data) => {
                  return {
                    value: data
                      .toFiat(baseCurrency)
                      .toDisplayStringWithSymbol(2),
                    symbol: data.symbol,
                  };
                }),
              ],
            }
          : undefined,
      actionRow: undefined,
      tokenId: ' ',
      isTotalRow: true,
    } as unknown as typeof detailedHoldings[number]);

    return {
      detailedHoldings: detailedHoldings,
      totals,
    };
  }, [holdings, baseCurrency, history, fiatToken, NOTE, pendingTokens]);
}
