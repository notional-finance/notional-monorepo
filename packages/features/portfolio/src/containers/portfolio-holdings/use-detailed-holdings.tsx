import { FiatKeys, TokenBalance } from '@notional-finance/core-entities';
import {
  formatCryptoWithFiat,
  formatNumberAsPercent,
  formatNumberAsPercentWithUndefined,
  formatTokenType,
  getHoldingsSortOrder,
} from '@notional-finance/helpers';
import {
  usePendingPnLCalculation,
  usePortfolioHoldings,
  useSelectedNetwork,
  useTotalPortfolioHoldings,
} from '@notional-finance/notionable-hooks';
import { PORTFOLIO_ACTIONS, TXN_HISTORY_TYPE } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

export function useDetailedHoldingsTable(baseCurrency: FiatKeys) {
  const network = useSelectedNetwork();
  const holdings = usePortfolioHoldings(network);
  const totals = useTotalPortfolioHoldings(network);
  const pendingTokens = usePendingPnLCalculation(network).flatMap(
    ({ tokens }) => tokens
  );
  const navigate = useNavigate();

  const detailedHoldings = (holdings || [])
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
        // const pointsPerDay = getPointsPerDay(b);
        // const totalPoints =
        //   arbPoints?.find(({ token }) => token === b.tokenId)?.points || 0;
        const marketApy = marketYield?.totalAPY;
        const noteIncentives = marketYield?.incentives?.incentiveAPY;
        const secondaryIncentives = marketYield?.incentives?.incentiveAPY;
        const secondarySymbol = marketYield?.incentives?.symbol;

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

        if (hasNToken) {
          buttonBarData.push({
            buttonText: <FormattedMessage defaultMessage={'Manage'} />,
            callback: () => {
              navigate(
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
              navigate(
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
              navigate(
                `/portfolio/${network}/holdings/${PORTFOLIO_ACTIONS.REPAY_DEBT}/${maturedTokenId}`
              );
            },
          });
        }

        const totalAtMaturity =
          b.token.tokenType === 'fCash' && s?.accumulatedCostRealized
            ? TokenBalance.from(
                b.scaleTo(b.underlying.decimals),
                b.underlying
              ).sub(s.accumulatedCostRealized)
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
            warning: hasMatured ? 'fCashMatured' : isHighUtilization,
            showRowWarning: !!isHighUtilization,
            subRowData,
            buttonBarData,
            txnHistory: `/portfolio/${network}/transaction-navigate?${new URLSearchParams(
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

  const totalHoldingsRow = {
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
    amountPaid: totals?.amountPaid.toDisplayStringWithSymbol(2) || '-',
    presentValue: totals?.presentValue.toDisplayStringWithSymbol(2) || '-',
    earnings: totals?.earnings.toDisplayStringWithSymbol(
      2,
      true,
      true,
      'en-US',
      true
    ),
    toolTipData:
      totals?.perIncentiveEarnings && totals.perIncentiveEarnings.length > 0
        ? {
            totalEarnings: [
              {
                value: totals?.nonNoteEarnings
                  .toFiat(baseCurrency)
                  .toDisplayStringWithSymbol(2),
                symbol: 'ORGANIC',
              },
              ...(totals?.perIncentiveEarnings || []).map((data) => {
                return {
                  value: data.toFiat(baseCurrency).toDisplayStringWithSymbol(2),
                  symbol: data.symbol,
                };
              }),
            ],
          }
        : undefined,
    actionRow: undefined,
    tokenId: ' ',
    isTotalRow: true,
  };

  return {
    detailedHoldings,
    totalHoldingsRow,
  };
}
