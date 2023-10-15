import { TokenBalance } from '@notional-finance/core-entities';
import {
  formatCryptoWithFiat,
  formatLeverageRatio,
  formatMaturity,
  formatNumberAsPercent,
  formatNumberAsPercentWithUndefined,
  formatTokenType,
} from '@notional-finance/helpers';
import {
  useFiat,
  useNOTE,
  useGroupedTokens,
} from '@notional-finance/notionable-hooks';
import { TXN_HISTORY_TYPE, leveragedYield } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

function formatCaption(asset: TokenBalance, debt: TokenBalance) {
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

export function useGroupedHoldings() {
  const baseCurrency = useFiat();
  const NOTE = useNOTE();
  const groupedTokens = useGroupedTokens();

  const groupedRows = groupedTokens.map(
    ({
      asset: {
        balance: asset,
        marketYield: assetYield,
        statement: assetStatement,
      },
      debt: { balance: debt, statement: debtStatement, marketYield: debtYield },
      leverageRatio,
      presentValue,
    }) => {
      const underlying = asset.underlying;
      const { icon } = formatTokenType(asset.token);

      // NOTE: this accounts for matured debts and uses the variable APY after maturity
      const borrowAPY =
        debtYield?.token.tokenType === 'PrimeDebt'
          ? debtYield?.totalAPY
          : debtStatement?.impliedFixedRate;

      const marketApy = leveragedYield(
        assetYield?.totalAPY,
        borrowAPY,
        leverageRatio
      );
      const noteAPY = assetYield?.incentives?.find(
        (i) => i.tokenId === NOTE?.id
      )?.incentiveAPY;
      const noteIncentives =
        noteAPY !== undefined
          ? leveragedYield(noteAPY, 0, leverageRatio)
          : undefined;

      const amountPaid =
        assetStatement && debtStatement
          ? assetStatement?.accumulatedCostRealized.add(
              debtStatement?.accumulatedCostRealized
            )
          : undefined;
      const earnings =
        assetStatement && debtStatement
          ? assetStatement?.totalProfitAndLoss.add(
              debtStatement?.totalProfitAndLoss
            )
          : undefined;

      return {
        asset: {
          symbol: icon,
          label:
            asset.tokenType === 'nToken'
              ? `Leveraged ${underlying.symbol} Liquidity`
              : `Leveraged ${underlying.symbol} Lend`,
          caption: formatCaption(asset, debt),
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
        earnings: earnings
          ? earnings.toFiat(baseCurrency).toDisplayStringWithSymbol(3, true)
          : '-',
        actionRow: {
          subRowData: [
            {
              label: <FormattedMessage defaultMessage={'Borrow APY'} />,
              value: formatNumberAsPercentWithUndefined(borrowAPY, '-', 3),
            },
            {
              label: <FormattedMessage defaultMessage={'Strategy APY'} />,
              value: formatNumberAsPercentWithUndefined(
                assetYield?.totalAPY,
                '-',
                3
              ),
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
                return;
              },
            },
            {
              buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
              callback: () => {
                return;
              },
            },
          ],
          txnHistory: `/portfolio/transaction-history?${new URLSearchParams({
            txnHistoryType: TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS,
            assetOrVaultId: asset.token.id,
          })}`,
        },
      };
    }
  );

  return {
    groupedRows,
    groupedTokens: groupedTokens.flatMap(({ asset, debt }) => [
      asset.balance.tokenId,
      debt.balance.tokenId,
    ]),
  };
}
