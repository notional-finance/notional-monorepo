import { useTheme } from '@mui/material';
import { TokenBalance, getPointsPerDay } from '@notional-finance/core-entities';
import {
  formatCryptoWithFiat,
  formatNumberAsAbbr,
  formatNumberAsPercent,
  formatNumberAsPercentWithUndefined,
  formatTokenType,
  getHoldingsSortOrder,
} from '@notional-finance/helpers';
import { PointsIcon } from '@notional-finance/icons';
import { Body, H4 } from '@notional-finance/mui';
import {
  useArbPoints,
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
  const theme = useTheme();
  const network = useSelectedNetwork();
  const holdings = usePortfolioHoldings(network);
  const pendingTokens = usePendingPnLCalculation(network).flatMap(
    ({ tokens }) => tokens
  );
  const arbPoints = useArbPoints();
  const history = useHistory();
  const baseCurrency = useFiat();
  const fiatToken = useFiatToken();
  const NOTE = useNOTE(network);

  return useMemo(() => {
    const totals = holdings.reduce(
      (t, { balance, statement, perIncentiveEarnings }) => {
        const totalEarningsWithNOTE = statement?.totalProfitAndLoss
          .toFiat(baseCurrency)
          .add(
            perIncentiveEarnings.reduce(
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
          const totalNOTEEarnings = perIncentiveEarnings.find(
            (t) => t.symbol === 'NOTE'
          );
          t.noteEarnings = totalNOTEEarnings
            ? t?.noteEarnings?.add(totalNOTEEarnings)
            : t.noteEarnings;

          perIncentiveEarnings.forEach((data) => {
            const currentTokenBalance = t.perIncentiveEarnings.findIndex(
              (t) => t.symbol === data.symbol
            );
            if (currentTokenBalance > -1) {
              t.perIncentiveEarnings[currentTokenBalance] =
                t.perIncentiveEarnings[currentTokenBalance].add(data);
            } else {
              t.perIncentiveEarnings.push(data);
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
        perIncentiveEarnings: [] as TokenBalance[],
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
          perIncentiveEarnings,
          hasMatured,
          isHighUtilization,
          totalEarningsWithIncentives,
          hasNToken,
        }) => {
          const isDebt = b.isNegative();
          const { icon, formattedTitle, titleWithMaturity, title } =
            formatTokenType(b.token, isDebt);
          const pointsPerDay = getPointsPerDay(b);
          const totalPoints =
            arbPoints?.find(({ token }) => token === b.tokenId)?.points || 0;
          const marketApy = marketYield?.totalAPY;
          const noteIncentives = marketYield?.noteIncentives?.incentiveAPY;
          const secondaryIncentives =
            marketYield?.secondaryIncentives?.incentiveAPY;
          const secondarySymbol = marketYield?.secondaryIncentives?.symbol;

          const buttonBarData: {
            buttonText: React.ReactNode;
            callback: () => void;
          }[] = [];

          const subRowData: {
            label: React.ReactNode;
            value: React.ReactNode;
          }[] = [
            {
              label: <FormattedMessage defaultMessage={'Amount'} />,
              value: `${b.toDisplayString(4, true)} ${title}`,
            },
            {
              label: <FormattedMessage defaultMessage={'Entry Price'} />,
              value: s ? s.adjustedCostBasis.toDisplayStringWithSymbol() : '-',
            },
            {
              label: <FormattedMessage defaultMessage={'Current Price'} />,
              value: `${TokenBalance.unit(b.token)
                .toUnderlying()
                .toDisplayString(4)} ${b.underlying.symbol}`,
            },
          ];

          if (totalPoints > 0) {
            subRowData.push({
              label: <FormattedMessage defaultMessage={'Points Earned'} />,
              value: (
                <H4 sx={{ display: 'flex' }}>
                  <PointsIcon sx={{ marginRight: theme.spacing(0.5) }} />
                  {formatNumberAsAbbr(totalPoints, 2, 'USD', {
                    hideSymbol: true,
                  })}
                  <Body
                    sx={{
                      marginLeft: theme.spacing(0.5),
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    (
                    {formatNumberAsAbbr(pointsPerDay, 2, 'USD', {
                      hideSymbol: true,
                    })}
                    )/day
                  </Body>
                </H4>
              ),
            });
          }

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

          const totalAtMaturity =
            b.token.tokenType === 'fCash'
              ? TokenBalance.from(
                  b.scaleTo(b.underlying.decimals),
                  b.underlying
                )
              : undefined;

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
            earnings: {
              data: [
                {
                  displayValue: totalEarningsWithIncentives
                    ? totalEarningsWithIncentives
                        .toFiat(baseCurrency)
                        .toDisplayStringWithSymbol(2)
                    : '-',
                  isNegative: totalEarningsWithIncentives
                    ? totalEarningsWithIncentives
                        .toFiat(baseCurrency)
                        .isNegative()
                    : false,
                },
                {
                  displayValue:
                    b.token.tokenType === 'fCash'
                      ? `${totalAtMaturity?.toDisplayStringWithSymbol(
                          2
                        )} at Maturity`
                      : '',
                  isNegative: false,
                },
              ],
            },
            toolTipData:
              perIncentiveEarnings.length > 0
                ? {
                    perAssetEarnings: [
                      {
                        underlying:
                          s?.totalProfitAndLoss.toDisplayStringWithSymbol(),
                        baseCurrency: s?.totalProfitAndLoss
                          .toFiat(baseCurrency)
                          .toDisplayStringWithSymbol(2),
                      },
                      ...perIncentiveEarnings.map((i) => ({
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
              subRowData,
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
        totals.perIncentiveEarnings.length > 0
          ? {
              totalEarnings: [
                {
                  value: totals.nonNoteEarnings
                    .toFiat(baseCurrency)
                    .toDisplayStringWithSymbol(2),
                  symbol: 'ORGANIC',
                },
                ...totals.perIncentiveEarnings.map((data) => {
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
  }, [
    holdings,
    arbPoints,
    baseCurrency,
    history,
    fiatToken,
    NOTE,
    pendingTokens,
    network,
    theme,
  ]);
}
