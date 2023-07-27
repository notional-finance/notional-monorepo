// import {
//   useRiskRatios,
//   useRiskThresholds,
// } from '@notional-finance/notionable-hooks';
// import { AccountData } from '@notional-finance/sdk';
// import { zipByKeyToArray } from '@notional-finance/helpers';
// import { FormattedMessage } from 'react-intl';
// import {
//   didIncrease,
//   formatCurrencyForRisk,
//   formatPercentForRisk,
//   formatRateAsPercent,
//   RiskDataTableRow,
// } from '../helpers/risk-data-helpers';

// export const useLiquidationRiskTable = (updatedAccountData?: AccountData) => {
//   const currentRiskRatios = useRiskRatios();
//   const updatedRiskRatios = useRiskRatios(updatedAccountData);
//   const currentRiskThresholds = useRiskThresholds();
//   const updatedRiskThresholds = useRiskThresholds(updatedAccountData);

//   const tableData: RiskDataTableRow[] = [
//     {
//       riskType: {
//         type: <FormattedMessage defaultMessage="Collateralization Ratio" />,
//       },
//       current: formatPercentForRisk(currentRiskRatios?.collateralRatio),
//       updated: {
//         value: formatPercentForRisk(updatedRiskRatios?.collateralRatio),
//         arrowUp: didIncrease(
//           currentRiskRatios?.collateralRatio,
//           updatedRiskRatios?.collateralRatio
//         ),
//         checkmark: updatedRiskRatios?.collateralRatio === null,
//         greenOnArrowUp:
//           // Edge case when decreases to null we want to show green
//           // Edge case when increases from null we want to show red
//           currentRiskRatios?.collateralRatio === null ||
//           updatedRiskRatios?.collateralRatio === null
//             ? false
//             : true,
//         greenOnCheckmark: true,
//       },
//     },
//     {
//       riskType: {
//         type: <FormattedMessage defaultMessage="Loan to Value Ratio" />,
//       },
//       current: formatPercentForRisk(currentRiskRatios?.loanToValue),
//       updated: {
//         value: formatPercentForRisk(updatedRiskRatios?.loanToValue),
//         arrowUp: didIncrease(
//           currentRiskRatios?.loanToValue,
//           updatedRiskRatios?.loanToValue
//         ),
//         checkmark: updatedRiskRatios?.loanToValue === null,
//         greenOnArrowUp: false,
//         greenOnCheckmark: true,
//       },
//     },
//   ];

//   const mergedLiquidationPrices = zipByKeyToArray(
//     currentRiskThresholds.liquidationPrices,
//     updatedRiskThresholds.liquidationPrices,
//     (t) => t.id
//   );
//   const liquidationData = mergedLiquidationPrices.map(([current, updated]) => {
//     // One of these is guaranteed to be defined
//     const collateralSymbol: string = (current?.collateralSymbol ||
//       updated?.collateralSymbol)!;
//     const debtSymbol: string = (current?.debtSymbol || updated?.debtSymbol)!;

//     return {
//       riskType: {
//         type: <FormattedMessage defaultMessage="Liquidation Price" />,
//         icons: [collateralSymbol, debtSymbol],
//       },
//       current: formatCurrencyForRisk(current?.liquidationPrice),
//       updated: {
//         value: formatCurrencyForRisk(updated?.liquidationPrice),
//         arrowUp: didIncrease(
//           current?.liquidationPrice?.toFloat(),
//           updated?.liquidationPrice?.toFloat()
//         ),
//         checkmark: updated?.liquidationPrice === undefined,
//         greenOnArrowUp: false,
//         greenOnCheckmark: true,
//       },
//     };
//   });

//   const mergedInterestRateRisk = zipByKeyToArray(
//     currentRiskThresholds.interestRateRiskArray,
//     updatedRiskThresholds.interestRateRiskArray,
//     (t) => t.id.toString()
//   );

//   const interestRateRiskData: RiskDataTableRow[] =
//     mergedInterestRateRisk.flatMap(([current, updated]) => {
//       // One of these is guaranteed to be defined
//       const symbol: string = (current?.symbol || updated?.symbol)!;
//       const risks: any[] = [];

//       if (
//         current?.upperLiquidationInterestRate ||
//         updated?.upperLiquidationInterestRate
//       ) {
//         risks.push({
//           riskType: {
//             type: (
//               <FormattedMessage defaultMessage="Upper Interest Rate Risk" />
//             ),
//             icons: [symbol],
//           },
//           current: formatRateAsPercent(current?.upperLiquidationInterestRate),
//           updated: {
//             value: formatRateAsPercent(updated?.upperLiquidationInterestRate),
//             arrowUp: didIncrease(
//               current?.upperLiquidationInterestRate,
//               updated?.upperLiquidationInterestRate
//             ),
//             checkmark: updated?.upperLiquidationInterestRate === undefined,
//             greenOnArrowUp: current?.upperLiquidationInterestRate
//               ? true
//               : false,
//             greenOnCheckmark: true,
//           },
//         });
//       }

//       if (
//         current?.lowerLiquidationInterestRate ||
//         updated?.lowerLiquidationInterestRate
//       ) {
//         risks.push({
//           riskType: {
//             type: (
//               <FormattedMessage defaultMessage="Lower Interest Rate Risk" />
//             ),
//             icons: [symbol],
//           },
//           current: formatRateAsPercent(current?.lowerLiquidationInterestRate),
//           updated: {
//             value: formatRateAsPercent(updated?.lowerLiquidationInterestRate),
//             arrowUp: didIncrease(
//               current?.lowerLiquidationInterestRate,
//               updated?.lowerLiquidationInterestRate
//             ),
//             checkmark: updated?.lowerLiquidationInterestRate === undefined,
//             greenOnArrowUp: false,
//             greenOnCheckmark: true,
//           },
//         });
//       }

//       return risks;
//     });

//   tableData.push(...liquidationData);
//   tableData.push(...interestRateRiskData);

//   return { tableData };
// };
