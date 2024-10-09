// import { useState, useEffect, useMemo } from 'react';
// import { FormattedMessage } from 'react-intl';
// import {
//   MultiValueIconCell,
//   DataTableColumn,
//   MultiValueCell,
// } from '@notional-finance/mui';
// import { ExpandedState } from '@tanstack/react-table';
// import { useTheme } from '@mui/material';
// import {
//   useSelectedNetwork,
//   useFiat,
//   useVaultHoldings,
// } from '@notional-finance/notionable-hooks';
// import {
//   formatCryptoWithFiat,
//   formatNumberAsAbbr,
//   formatTokenType,
// } from '@notional-finance/helpers';
// import {
//   PRIME_CASH_VAULT_MATURITY,
//   formatMaturity,
// } from '@notional-finance/util';
// import { FiatSymbols } from '@notional-finance/core-entities';

// function insertVaultDivider(arr) {
//   const result = arr;
//   let vaultName = '';

//   for (let i = 0; i < arr.length; i++) {
//     const data = arr[i];
//     if (vaultName !== data.vaultName) {
//       result.splice(i, 0, {
//         vault: {
//           symbol: '',
//           symbolBottom: '',
//           label: data.vaultName,
//           caption: '',
//         },
//         accruedInterest: '',
//         marketPNL: '',
//         feesPaid: '',
//         totalEarnings: '',
//         isTotalRow: true,
//         isDividerRow: true,
//       });
//       vaultName = data.vaultName;
//     }
//   }
//   return result;
// }

// export function useVaultEarnings(isGrouped: boolean) {
//   const theme = useTheme();
//   const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
//   const network = useSelectedNetwork();
//   const baseCurrency = useFiat();
//   const vaults = useVaultHoldings(network);

//   const Columns = useMemo<DataTableColumn[]>(
//     () => [
//       {
//         header: <FormattedMessage defaultMessage="Vault" />,
//         cell: MultiValueIconCell,
//         accessorKey: 'vault',
//         textAlign: 'left',
//         expandableTable: true,
//         width: theme.spacing(37.5),
//       },
//       // {
//       //   header: <FormattedMessage defaultMessage="Incentives Earnings" />,
//       //   cell: DisplayCell,
//       //   // ToolTip: TotalEarningsTooltip,
//       //   accessorKey: 'incentivesEarnings',
//       //   textAlign: 'right',
//       //   expandableTable: true,
//       //   showLoadingSpinner: true,
//       //   showGreenText: true,
//       // },
//       {
//         header: <FormattedMessage defaultMessage="Accrued Interest" />,
//         cell: MultiValueCell,
//         // ToolTip: TotalEarningsTooltip,
//         accessorKey: 'accruedInterest',
//         textAlign: 'right',
//         expandableTable: true,
//         fontWeightBold: true,
//         showLoadingSpinner: true,
//         showGreenText: true,
//       },
//       {
//         header: <FormattedMessage defaultMessage="Market PNL" />,
//         cell: MultiValueCell,
//         accessorKey: 'marketPNL',
//         textAlign: 'right',
//         fontWeightBold: true,
//         expandableTable: true,
//         showGreenText: true,
//       },
//       {
//         header: <FormattedMessage defaultMessage="Fees Paid" />,
//         cell: MultiValueCell,
//         accessorKey: 'feesPaid',
//         textAlign: 'right',
//         expandableTable: true,
//         fontWeightBold: true,
//       },
//       {
//         header: <FormattedMessage defaultMessage="Total Earnings" />,
//         cell: MultiValueCell,
//         accessorKey: 'totalEarnings',
//         textAlign: 'right',
//         fontWeightBold: true,
//         expandableTable: true,
//         showLoadingSpinner: true,
//         showGreenText: true,
//       },
//     ],
//     [theme]
//   );

//   const vaultTotals = vaults
//     .map(
//       ({ totalInterestAccrual, marketProfitLoss, totalILAndFees, profit }) => {
//         return {
//           accruedInterest:
//             totalInterestAccrual?.toFiat(baseCurrency).toFloat() || 0,
//           marketPNL: marketProfitLoss?.toFiat(baseCurrency).toFloat() || 0,
//           feesPaid: totalILAndFees?.toFiat(baseCurrency).toFloat() || 0,
//           totalEarnings: profit?.toFiat(baseCurrency).toFloat() || 0,
//         };
//       }
//     )
//     .reduce(
//       (accumulator, current) => {
//         accumulator.accruedInterest += current.accruedInterest || 0;
//         accumulator.marketPNL += current.marketPNL || 0;
//         accumulator.feesPaid += current.feesPaid || 0;
//         accumulator.totalEarnings += current.totalEarnings || 0;
//         return accumulator;
//       },
//       {
//         accruedInterest: 0,
//         marketPNL: 0,
//         feesPaid: 0,
//         totalEarnings: 0,
//       }
//     );

//   const earningsBreakdownData = isGrouped
//     ? vaults.map(
//         ({
//           vault: v,
//           denom,
//           totalInterestAccrual,
//           totalILAndFees,
//           marketProfitLoss,
//           profit,
//         }) => {
//           return {
//             vault: {
//               symbol: formatTokenType(denom).icon,
//               label: v.vaultConfig.name,
//               caption:
//                 v.maturity === PRIME_CASH_VAULT_MATURITY
//                   ? 'Open Term'
//                   : `Maturity: ${formatMaturity(v.maturity)}`,
//             },
//             accruedInterest: formatCryptoWithFiat(
//               baseCurrency,
//               totalInterestAccrual
//             ),
//             marketPNL: formatCryptoWithFiat(baseCurrency, marketProfitLoss),
//             feesPaid: formatCryptoWithFiat(baseCurrency, totalILAndFees),
//             totalEarnings: formatCryptoWithFiat(baseCurrency, profit),
//             isDebt: true,
//           };
//         }
//       )
//     : vaults.flatMap(({ vault: v, denom, assetPnL, debtPnL }) => {
//         const vaultDebt = v.vaultDebt.unwrapVaultToken().token;
//         const { icon, formattedTitle, titleWithMaturity } = formatTokenType(
//           vaultDebt,
//           true
//         );
//         const vaultCell = {
//           symbol: formatTokenType(denom).icon,
//           label: v.vaultConfig.name,
//           caption:
//             v.maturity === PRIME_CASH_VAULT_MATURITY
//               ? 'Open Term'
//               : `Maturity: ${formatMaturity(v.maturity)}`,
//         };
//         const assetMarketPnL = assetPnL?.totalProfitAndLoss.sub(
//           assetPnL.totalInterestAccrual
//         );
//         const debtMarketPnL = debtPnL?.totalProfitAndLoss.sub(
//           debtPnL.totalInterestAccrual
//         );

//         return [
//           // Vault Shares
//           {
//             vault: vaultCell,
//             accruedInterest: {
//               data: [
//                 {
//                   displayValue: assetPnL?.totalInterestAccrual
//                     ? assetPnL?.totalInterestAccrual
//                         ?.toFiat(baseCurrency)
//                         .toDisplayStringWithSymbol(2)
//                     : `${FiatSymbols[baseCurrency]}0.00`,
//                   isNegative: false,
//                 },
//                 {
//                   displayValue: '',
//                   isNegative: false,
//                 },
//               ],
//             },
//             marketPNL: formatCryptoWithFiat(baseCurrency, assetMarketPnL),
//             feesPaid: formatCryptoWithFiat(
//               baseCurrency,
//               assetPnL?.totalILAndFees
//             ),
//             totalEarnings: {
//               data: [
//                 {
//                   displayValue: assetPnL?.totalProfitAndLoss
//                     ? assetPnL?.totalProfitAndLoss
//                         ?.toFiat(baseCurrency)
//                         .toDisplayStringWithSymbol(2)
//                     : `${FiatSymbols[baseCurrency]}0.00`,
//                   isNegative: false,
//                 },
//                 {
//                   displayValue: '',
//                   isNegative: false,
//                 },
//               ],
//             },
//             vaultName: v.vaultConfig.name,
//           },
//           // Vault Debt
//           {
//             vault: {
//               symbol: icon,
//               symbolBottom: '',
//               label: formattedTitle,
//               caption: titleWithMaturity,
//             },
//             accruedInterest: {
//               data: [
//                 {
//                   displayValue: debtPnL?.totalInterestAccrual
//                     ? debtPnL?.totalInterestAccrual
//                         ?.toFiat(baseCurrency)
//                         .toDisplayStringWithSymbol(2)
//                     : '-',
//                   isNegative: debtPnL?.totalInterestAccrual.isNegative(),
//                 },
//                 {
//                   displayValue: '',
//                   isNegative: false,
//                 },
//               ],
//             },
//             marketPNL: formatCryptoWithFiat(baseCurrency, debtMarketPnL),
//             feesPaid: formatCryptoWithFiat(
//               baseCurrency,
//               debtPnL?.totalILAndFees
//             ),
//             totalEarnings: {
//               data: [
//                 {
//                   displayValue: debtPnL?.totalProfitAndLoss
//                     ? debtPnL?.totalProfitAndLoss
//                         ?.toFiat(baseCurrency)
//                         .toDisplayStringWithSymbol(2)
//                     : '-',
//                   isNegative: debtPnL?.totalProfitAndLoss.isNegative(),
//                 },
//                 {
//                   displayValue: '',
//                   isNegative: false,
//                 },
//               ],
//             },
//             vaultName: v.vaultConfig.name,
//             isDebt: true,
//           },
//         ];
//       });

//   useEffect(() => {
//     const formattedExpandedRows = Columns.reduce(
//       (accumulator, _value, index) => {
//         return { ...accumulator, [index]: index === 0 ? true : false };
//       },
//       {}
//     );

//     if (
//       expandedRows === null &&
//       JSON.stringify(formattedExpandedRows) !== '{}'
//     ) {
//       setExpandedRows(formattedExpandedRows);
//     }
//   }, [expandedRows, setExpandedRows, Columns]);

//   const finalEarningsData = !isGrouped
//     ? insertVaultDivider(earningsBreakdownData)
//     : earningsBreakdownData;

//   finalEarningsData.push({
//     vault: {
//       symbol: '',
//       symbolBottom: '',
//       label: 'Total',
//       caption: '',
//     },
//     accruedInterest: {
//       data: [
//         {
//           displayValue:
//             vaultTotals.accruedInterest === 0
//               ? '-'
//               : formatNumberAsAbbr(
//                   vaultTotals.accruedInterest,
//                   2,
//                   baseCurrency
//                 ),
//           isNegative: vaultTotals.accruedInterest < 0,
//         },
//         {
//           displayValue: '',
//           isNegative: false,
//         },
//       ],
//     },
//     marketPNL: {
//       data: [
//         {
//           displayValue:
//             vaultTotals.marketPNL === 0
//               ? '-'
//               : formatNumberAsAbbr(vaultTotals.marketPNL, 2, baseCurrency),
//           isNegative: vaultTotals.marketPNL < 0,
//         },
//         {
//           displayValue: '',
//           isNegative: false,
//         },
//       ],
//     },
//     feesPaid: {
//       data: [
//         {
//           displayValue:
//             vaultTotals.feesPaid === 0
//               ? '-'
//               : formatNumberAsAbbr(vaultTotals.feesPaid, 2, baseCurrency),
//           isNegative: vaultTotals.feesPaid < 0,
//         },
//         {
//           displayValue: '',
//           isNegative: false,
//         },
//       ],
//     },
//     totalEarnings: {
//       data: [
//         {
//           displayValue:
//             vaultTotals.totalEarnings === 0
//               ? '-'
//               : formatNumberAsAbbr(vaultTotals.totalEarnings, 2, baseCurrency),
//           isNegative: vaultTotals.totalEarnings < 0,
//         },
//         {
//           displayValue: '',
//           isNegative: false,
//         },
//       ],
//     },
//     actionRow: undefined,
//     tokenId: ' ',
//     isTotalRow: true,
//     isDebt: true,
//   } as unknown as typeof earningsBreakdownData[number]);

//   return {
//     earningsBreakdownColumns: Columns,
//     earningsBreakdownData: finalEarningsData,
//     setExpandedRows,
//     initialState: { clickDisabled: true },
//   };
// }
