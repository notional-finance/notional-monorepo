import { TokenBalance } from '@notional-finance/core-entities';
import {
  formatCryptoWithFiat,
  formatLeverageRatio,
  formatNumberAsPercent,
  formatNumberAsPercentWithUndefined,
  formatTokenType,
  getHoldingsSortOrder,
} from '@notional-finance/helpers';
import {
  useFiat,
  useGroupedHoldings,
  usePendingPnLCalculation,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import {
  TXN_HISTORY_TYPE,
  leveragedYield,
  formatMaturity,
} from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

export function formatCaption(asset: TokenBalance, debt: TokenBalance) {
  if (asset.tokenType === 'nToken' && debt.tokenType === 'PrimeDebt') {
    return 'Variable Borrow';
  } else if (asset.tokenType === 'nToken' && debt.tokenType === 'fCash') {
    return `Fixed Borrow: ${formatMaturity(debt.maturity)}`;
  } else if (asset.tokenType === 'fCash' && debt.tokenType === 'PrimeDebt') {
    return `Fixed Lend: ${formatMaturity(asset.maturity)}, Variable Borrow`;
  } else if (asset.tokenType === 'PrimeCash' && debt.tokenType === 'fCash') {
    return `Variable Lend, Fixed Borrow: ${formatMaturity(debt.maturity)}`;
  } else if (asset.tokenType === 'fCash' && debt.tokenType === 'fCash') {
    return `Fixed Lend: ${formatMaturity(
      asset.maturity
    )}, Fixed Borrow: ${formatMaturity(debt.maturity)}`;
  } else {
    return undefined;
  }
}

export function useGroupedHoldingsTable() {
  const baseCurrency = useFiat();
  const network = useSelectedNetwork();
  const groupedTokens = useGroupedHoldings(network) || [];
  const pendingTokens = usePendingPnLCalculation(network).flatMap(
    ({ tokens }) => tokens
  );
  const history = useHistory();

  const groupedRows = groupedTokens.map(
    ({
      asset: {
        balance: asset,
        marketYield: assetYield,
        statement: assetStatement,
        perIncentiveEarnings,
        isHighUtilization,
      },
      debt: { balance: debt, statement: debtStatement },
      hasMatured,
      leverageRatio,
      presentValue,
      borrowAPY,
      totalEarnings,
      totalLeveragedApy,
    }) => {
      const underlying = asset.underlying;
      const { icon } = formatTokenType(asset.token);
      const debtData = formatTokenType(debt.token);

      const noteAPY = assetYield?.noteIncentives?.incentiveAPY;
      const noteIncentives =
        noteAPY !== undefined
          ? leveragedYield(noteAPY, 0, leverageRatio)
          : undefined;
      const secondaryAPY = assetYield?.secondaryIncentives?.incentiveAPY;
      const secondarySymbol = assetYield?.secondaryIncentives?.symbol;
      const secondaryIncentives =
        secondaryAPY !== undefined && secondarySymbol
          ? leveragedYield(secondaryAPY, 0, leverageRatio)
          : undefined;

      const amountPaid =
        assetStatement && debtStatement
          ? assetStatement?.accumulatedCostRealized.add(
              debtStatement?.accumulatedCostRealized
            )
          : undefined;

      return {
        sortOrder: getHoldingsSortOrder(asset.token),
        tokenId: asset.tokenId,
        asset: {
          symbol: icon,
          symbolBottom: debtData?.icon,
          label:
            asset.tokenType === 'nToken'
              ? `Leveraged ${underlying.symbol} Liquidity`
              : `Leveraged ${underlying.symbol} Lend`,
          caption: formatCaption(asset, debt) || '',
        },
        isPending: !!pendingTokens.find(
          (t) => t.id === asset.tokenId || t.id === debt.tokenId
        ),
        marketApy: {
          data: [
            {
              displayValue: formatNumberAsPercentWithUndefined(
                totalLeveragedApy,
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
                  : '',
              isNegative: false,
            },
          ],
        },
        amountPaid: amountPaid
          ? formatCryptoWithFiat(baseCurrency, amountPaid)
          : '-',
        presentValue: formatCryptoWithFiat(baseCurrency, presentValue),
        earnings: {
          data: [
            {
              displayValue: totalEarnings
                ? totalEarnings
                    .toFiat(baseCurrency)
                    .toDisplayStringWithSymbol(2)
                : '-',
              isNegative: totalEarnings
                ? totalEarnings.toFiat(baseCurrency).isNegative()
                : false,
            },
            {
              displayValue: '',
              isNegative: false,
            },
          ],
        },
        toolTipData:
          perIncentiveEarnings.length > 0
            ? {
                perAssetEarnings: [
                  {
                    underlying: totalEarnings?.toDisplayStringWithSymbol(),
                    baseCurrency: totalEarnings
                      ?.toFiat(baseCurrency)
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
          subRowData: [
            {
              label: <FormattedMessage defaultMessage={'Borrow APY'} />,
              value: formatNumberAsPercentWithUndefined(borrowAPY, '-'),
            },
            {
              label: <FormattedMessage defaultMessage={'Strategy APY'} />,
              value: formatNumberAsPercentWithUndefined(
                assetYield?.totalAPY,
                '-'
              ),
              showLoadingSpinner: true,
            },
            {
              label: <FormattedMessage defaultMessage={'Leverage Ratio'} />,
              value: formatLeverageRatio(leverageRatio),
            },
          ],
          buttonBarData: [
            {
              buttonText: <FormattedMessage defaultMessage={'Manage'} />,
              callback: () => {
                history.push(
                  `/liquidity-leveraged/${network}/Manage/${underlying.symbol}`
                );
              },
            },
            {
              buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
              callback: () => {
                history.push(
                  `/liquidity-leveraged/${network}/Withdraw/${
                    underlying.symbol
                  }${isHighUtilization ? `?warning=${isHighUtilization}` : ''}`
                );
              },
            },
          ],
          hasMatured: hasMatured,
          txnHistory: `/portfolio/${network}/transaction-history?${new URLSearchParams(
            {
              txnHistoryType: TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS,
              assetOrVaultId: asset.token.id,
              debtId: debtStatement?.token.id || '',
            }
          )}`,
        },
      };
    }
  );

  return {
    groupedRows: groupedRows,
    groupedTokens: groupedTokens.flatMap(({ asset, debt }) => [
      asset.balance.tokenId,
      debt.balance.tokenId,
    ]),
  };
}
