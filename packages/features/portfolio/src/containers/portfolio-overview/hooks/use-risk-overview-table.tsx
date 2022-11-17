import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { useRiskThresholds } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useRiskOverviewTable = () => {
  const { interestRateRiskArray, liquidationPrices } = useRiskThresholds();

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
      let caption: string[] = [];
      if (hasNTokenCollateral && collateralSymbol)
        caption.push(`n${collateralSymbol}`);
      if (hasfCashCollateral && collateralSymbol)
        caption.push(`f${collateralSymbol}`);

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

  const riskOverviewData = priceRiskData;
  // {
  //   collateral: {
  //     symbol: 'ETH',
  //     label: 'ETH',
  //     caption: 'nETH, fETH',
  //   },
  //   riskFactor: {
  //     data: ['ETH/USD', 'Chainlink Oracle Price'],
  //     isNegative: false,
  //   },
  //   currentPrice: '1,200 USD',
  //   liquidationPrice: '897 USD',
  // },

  return {
    riskOverviewData,
    riskOverviewColumns,
  };
};
