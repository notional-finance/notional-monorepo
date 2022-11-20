import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { useRiskThresholds } from '@notional-finance/notionable-hooks';
import { formatRateForRisk } from '@notional-finance/risk/helpers/risk-data-helpers';
import { FormattedMessage } from 'react-intl';

export const useRiskOverviewTable = () => {
  const { interestRateRiskArray, liquidationPrices, vaultRiskThresholds } =
    useRiskThresholds();

  const riskOverviewColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage
          defaultMessage="Collateral"
          description={'column header'}
        />
      ),
      Cell: MultiValueIconCell,
      accessor: 'collateral',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Risk Factor"
          description={'column header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'riskFactor',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Current Price"
          description={'column header'}
        />
      ),
      accessor: 'currentPrice',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Liquidation Price"
          description={'column header'}
        />
      ),
      accessor: 'liquidationPrice',
      textAlign: 'right',
    },
  ];

  const priceRiskData = liquidationPrices.map(
    ({
      collateralSymbol,
      debtSymbol,
      hasNTokenCollateral,
      hasfCashCollateral,
      liquidationPrice,
      currentPrice,
    }) => {
      const caption: string[] = [];
      if (hasNTokenCollateral && collateralSymbol)
        caption.push(`n${collateralSymbol.toUpperCase()}`);
      if (hasfCashCollateral && collateralSymbol)
        caption.push(`f${collateralSymbol.toUpperCase()}`);

      return {
        collateral: {
          symbol: collateralSymbol,
          label: collateralSymbol,
          caption: caption.join(', '),
        },
        riskFactor: {
          data: [`${collateralSymbol}/${debtSymbol}`, 'Chainlink Oracle Price'],
          isNegative: false,
        },
        currentPrice: currentPrice?.toDisplayStringWithSymbol(2),
        liquidationPrice: liquidationPrice?.toDisplayStringWithSymbol(2),
      };
    }
  );

  const interestRateRiskData = interestRateRiskArray.map(
    ({
      symbol,
      hasNTokenCollateral,
      hasfCashCollateral,
      currentWeightedAvgInterestRate,
      lowerLiquidationInterestRate,
      upperLiquidationInterestRate,
    }) => {
      const caption: string[] = [];
      if (hasNTokenCollateral && symbol)
        caption.push(`n${symbol.toUpperCase()}`);
      if (hasfCashCollateral && symbol)
        caption.push(`f${symbol.toUpperCase()}`);

      let liquidationPrice: string;
      if (upperLiquidationInterestRate && lowerLiquidationInterestRate) {
        liquidationPrice = `Below ${formatRateForRisk(
          lowerLiquidationInterestRate,
          3
        )}, Above ${formatRateForRisk(upperLiquidationInterestRate, 3)}`;
      } else if (upperLiquidationInterestRate) {
        liquidationPrice = `Above ${formatRateForRisk(
          upperLiquidationInterestRate,
          3
        )}`;
      } else if (lowerLiquidationInterestRate) {
        liquidationPrice = `Below ${formatRateForRisk(
          lowerLiquidationInterestRate,
          3
        )}`;
      } else {
        liquidationPrice = '-';
      }

      return {
        collateral: {
          symbol: symbol,
          label: symbol,
          caption: caption.join(', '),
        },
        riskFactor: {
          data: [`${symbol} Interest Rates`, 'Notional Interest Rate Oracle'],
          isNegative: false,
        },
        currentPrice: currentWeightedAvgInterestRate
          ? formatRateForRisk(currentWeightedAvgInterestRate, 3)
          : '-',
        liquidationPrice,
      };
    }
  );

  const vaultRiskData = vaultRiskThresholds.map(
    ({
      primaryBorrowSymbol,
      currentPrice,
      vaultName,
      collateralCurrencySymbol,
      debtCurrencySymbol,
      ethExchangeRate,
    }) => {
      return {
        collateral: {
          symbol: primaryBorrowSymbol,
          label: vaultName,
          caption: 'Leveraged Vault',
        },
        riskFactor: {
          data: [
            `${collateralCurrencySymbol}/${debtCurrencySymbol}`,
            'Chainlink Oracle Price',
          ],
          isNegative: false,
        },
        // TODO: stETH is not listed as a collateral currency in the system so
        // we don't have a way to represent this using typed big numbers
        currentPrice: `${currentPrice?.toDisplayString(2)} stETH`,
        liquidationPrice: `${ethExchangeRate?.toDisplayString(2)} stETH`,
      };
    }
  );

  const riskOverviewData = priceRiskData
    .concat(interestRateRiskData)
    .concat(vaultRiskData);
  return {
    riskOverviewData,
    riskOverviewColumns,
  };
};
