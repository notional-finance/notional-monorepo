import { useRiskRatios, useRiskThresholds } from '@notional-finance/notionable-hooks';
import { AccountData } from '@notional-finance/sdk';
import { zipByKeyToArray } from '@notional-finance/utils';
import {
  didIncrease,
  formatCurrencyForRisk,
  formatPercentForRisk,
  formatRateForRisk,
  RiskDataTableRow,
} from '../helpers/risk-data-helpers';

export const useLiquidationRiskTable = (updatedAccountData?: AccountData) => {
  const currentRiskRatios = useRiskRatios();
  const updatedRiskRatios = useRiskRatios(updatedAccountData);
  const currentRiskThresholds = useRiskThresholds();
  const updatedRiskThresholds = useRiskThresholds(updatedAccountData);

  const tableData: RiskDataTableRow[] = [
    {
      riskType: { type: 'Collateralization Ratio' },
      current: formatPercentForRisk(currentRiskRatios?.collateralRatio),
      updated: {
        value: formatPercentForRisk(updatedRiskRatios?.collateralRatio),
        arrowUp: didIncrease(
          currentRiskRatios?.collateralRatio,
          updatedRiskRatios?.collateralRatio
        ),
        checkmark: updatedRiskRatios?.collateralRatio === null,
        greenOnArrowUp: true,
        greenOnCheckmark: true,
      },
    },
    {
      riskType: { type: 'Loan to Value Ratio' },
      current: formatPercentForRisk(currentRiskRatios?.loanToValue),
      updated: {
        value: formatPercentForRisk(updatedRiskRatios?.loanToValue),
        arrowUp: didIncrease(currentRiskRatios?.loanToValue, updatedRiskRatios?.loanToValue),
        checkmark: updatedRiskRatios?.loanToValue === null,
        greenOnArrowUp: false,
        greenOnCheckmark: true,
      },
    },
  ];

  const mergedLiquidationPrices = zipByKeyToArray(
    currentRiskThresholds.liquidationPrices,
    updatedRiskThresholds.liquidationPrices,
    (t) => t.id
  );
  const liquidationData = mergedLiquidationPrices.map(([current, updated]) => {
    // One of these is guaranteed to be defined
    const collateralSymbol: string = (current?.collateralSymbol || updated?.collateralSymbol)!;
    const debtSymbol: string = (current?.debtSymbol || updated?.debtSymbol)!;

    return {
      riskType: {
        type: 'Liquidation Price',
        icons: [collateralSymbol, debtSymbol],
      },
      current: formatCurrencyForRisk(current?.liquidationPrice),
      updated: {
        value: formatCurrencyForRisk(updated?.liquidationPrice),
        arrowUp: didIncrease(
          current?.liquidationPrice?.toFloat(),
          updated?.liquidationPrice?.toFloat()
        ),
        checkmark: updated?.liquidationPrice === undefined,
        greenOnArrowUp: false,
        greenOnCheckmark: true,
      },
    };
  });

  const mergedInterestRateRisk = zipByKeyToArray(
    currentRiskThresholds.interestRateRiskArray,
    updatedRiskThresholds.interestRateRiskArray,
    (t) => t.id.toString()
  );

  const interestRateRiskData: RiskDataTableRow[] = mergedInterestRateRisk.flatMap(
    ([current, updated]) => {
      // One of these is guaranteed to be defined
      const symbol: string = (current?.symbol || updated?.symbol)!;
      const risks: any[] = [];

      if (current?.upperLiquidationInterestRate || updated?.upperLiquidationInterestRate) {
        risks.push({
          riskType: {
            type: 'Upper Interest Rate Risk',
            icons: [symbol],
          },
          current: formatRateForRisk(current?.upperLiquidationInterestRate),
          updated: {
            value: formatRateForRisk(updated?.upperLiquidationInterestRate),
            arrowUp: didIncrease(
              current?.upperLiquidationInterestRate,
              updated?.upperLiquidationInterestRate
            ),
            checkmark: updated?.upperLiquidationInterestRate === undefined,
            greenOnArrowUp: current?.upperLiquidationInterestRate ? true : false,
            greenOnCheckmark: true,
          },
        });
      }

      if (current?.lowerLiquidationInterestRate || updated?.lowerLiquidationInterestRate) {
        risks.push({
          riskType: {
            type: 'Lower Interest Rate Risk',
            icons: [symbol],
          },
          current: formatRateForRisk(current?.lowerLiquidationInterestRate),
          updated: {
            value: formatRateForRisk(updated?.lowerLiquidationInterestRate),
            arrowUp: didIncrease(
              current?.lowerLiquidationInterestRate,
              updated?.lowerLiquidationInterestRate
            ),
            checkmark: updated?.lowerLiquidationInterestRate === undefined,
            greenOnArrowUp: false,
            greenOnCheckmark: true,
          },
        });
      }

      return risks;
    }
  );

  tableData.push(...liquidationData);
  tableData.push(...interestRateRiskData);

  return { tableData };
};
