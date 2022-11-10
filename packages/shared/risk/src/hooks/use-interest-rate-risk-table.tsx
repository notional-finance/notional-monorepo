import { IconCell, RailGradient, SliderCell } from '@notional-finance/mui';
import { useRiskThresholds } from '@notional-finance/notionable-hooks';
import {
  convertRateToFloat,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { formatRateForRisk } from '../helpers/risk-data-helpers';

const greyRGB: [number, number, number] = [149, 178, 186];
const redRGB: [number, number, number] = [255, 61, 13];
const stepSize = 0.01;

export const useInterestRateRiskTable = () => {
  const { interestRateRiskArray, maxMarketRates } = useRiskThresholds();
  const tableColumns: Record<string, any>[] = [
    {
      Header: 'Currency',
      Cell: IconCell,
      accessor: 'symbol',
      textAlign: 'left',
    },
    {
      Header: 'Lower Interest Rate',
      accessor: 'lowerRate',
      textAlign: 'right',
    },
    {
      Header: 'Current Average',
      accessor: 'currentAvg',
      textAlign: 'right',
    },
    {
      Header: 'Upper Interest Rate',
      accessor: 'upperRate',
      textAlign: 'right',
    },
    {
      Header: 'Interest Rate Risk',
      Cell: SliderCell,
      accessor: 'sliderData',
      textAlign: 'right',
    },
  ];

  const tableData = interestRateRiskArray.map(
    ({
      currentWeightedAvgInterestRate,
      lowerLiquidationInterestRate,
      upperLiquidationInterestRate,
      symbol,
      id,
    }) => {
      const maxRate = convertRateToFloat(maxMarketRates.get(id) || 30e9);
      const railGradients: RailGradient[] = [];
      if (lowerLiquidationInterestRate) {
        const lowerRate = convertRateToFloat(lowerLiquidationInterestRate);
        const boundary = (lowerRate / maxRate) * 100;
        railGradients.push({ color: redRGB, value: 0 });
        railGradients.push({ color: redRGB, value: boundary });
        railGradients.push({ color: greyRGB, value: boundary + stepSize });
      } else {
        railGradients.push({ color: greyRGB, value: 0 });
      }

      if (upperLiquidationInterestRate) {
        const upperRate = convertRateToFloat(upperLiquidationInterestRate);
        const boundary = (upperRate / maxRate) * 100;
        railGradients.push({ color: greyRGB, value: boundary });
        railGradients.push({ color: redRGB, value: boundary + stepSize });
        railGradients.push({ color: redRGB, value: 100 });
      } else {
        railGradients.push({ color: greyRGB, value: 100 });
      }

      return {
        symbol,
        lowerRate: formatRateForRisk(lowerLiquidationInterestRate),
        currentAvg: formatRateForRisk(currentWeightedAvgInterestRate),
        upperRate: formatRateForRisk(upperLiquidationInterestRate),
        sliderData: {
          stepSize,
          value: convertRateToFloat(currentWeightedAvgInterestRate || 0),
          railGradients,
          max: maxRate,
          captionRight: `Max: ${formatNumberAsPercent(maxRate, 1)}`,
        },
      };
    }
  );

  return { tableData, tableColumns };
};
