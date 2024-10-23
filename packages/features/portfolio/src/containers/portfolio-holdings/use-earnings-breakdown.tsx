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
//   usePortfolioHoldings,
//   useFiat,
//   useGroupedHoldings,
// } from '@notional-finance/notionable-hooks';
// import {
//   formatCryptoWithFiat,
//   formatNumberAsAbbr,
//   formatTokenType,
// } from '@notional-finance/helpers';
// import { formatCaption } from './use-grouped-holdings';
// import { FiatSymbols } from '@notional-finance/core-entities';

// function insertDebtDivider(arr) {
//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i]?.asset?.label.includes('Borrow')) {
//       arr.splice(i, 0, {
//         asset: {
//           symbol: '',
//           symbolBottom: '',
//           label: 'DEBT POSITIONS',
//           caption: '',
//         },
//         marketApy: {
//           data: [
//             {
//               displayValue: '',
//               isNegative: false,
//             },
//           ],
//         },
//         amountPaid: '',
//         presentValue: '',
//         earnings: '',
//         toolTipData: undefined,
//         actionRow: undefined,
//         tokenId: ' ',
//         isTotalRow: true,
//         isDividerRow: true,
//       });
//       break;
//     }
//   }
//   return arr;
// }

// export function useEarningsBreakdown(isGrouped: boolean) {
//   const theme = useTheme();
//   const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
//   const network = useSelectedNetwork();
//   const baseCurrency = useFiat();
//   const holdings = usePortfolioHoldings(network);
//   const groupedHoldings = useGroupedHoldings(network) || [];

//   const Columns = useMemo<DataTableColumn[]>(
//     () => [
//       {
//         header: <FormattedMessage defaultMessage="Asset" />,
//         cell: MultiValueIconCell,
//         accessorKey: 'asset',
//         textAlign: 'left',
//         expandableTable: true,
//         width: theme.spacing(37.5),
//       },
//       {
//         header: <FormattedMessage defaultMessage="Incentives Earnings" />,
//         cell: MultiValueCell,
//         // ToolTip: TotalEarningsTooltip,
//         accessorKey: 'incentivesEarnings',
//         fontWeightBold: true,
//         textAlign: 'right',
//         expandableTable: true,
//         showLoadingSpinner: true,
//         showGreenText: true,
//       },
//       {
//         header: <FormattedMessage defaultMessage="Accrued Interest" />,
//         cell: MultiValueCell,
//         // ToolTip: TotalEarningsTooltip,
//         fontWeightBold: true,
//         accessorKey: 'accruedInterest',
//         textAlign: 'right',
//         expandableTable: true,
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

//   const groupedEarnings = groupedHoldings.map(
//     ({
//       asset: {
//         balance: asset,
//         perIncentiveEarnings,
//         totalIncentiveEarnings,
//         totalEarningsWithIncentives,
//       },
//       debt: { balance: debt },
//       totalInterestAccrual,
//       totalILAndFees,
//       marketProfitLoss,
//     }) => {
//       const { icon } = formatTokenType(asset.token);
//       const debtData = formatTokenType(debt.token);
//       const underlying = asset.underlying;

//       return {
//         asset: {
//           symbol: icon,
//           symbolBottom: debtData?.icon,
//           label:
//             asset.tokenType === 'nToken'
//               ? `Leveraged ${underlying.symbol} Liquidity`
//               : `Leveraged ${underlying.symbol} Lend`,
//           caption: formatCaption(asset, debt) || '',
//         },
//         incentivesEarnings: formatCryptoWithFiat(
//           baseCurrency,
//           totalIncentiveEarnings
//         ),
//         toolTipData:
//           perIncentiveEarnings.length > 0
//             ? {
//                 perAssetEarnings: perIncentiveEarnings?.map((i) => ({
//                   underlying: i.toDisplayStringWithSymbol(2),
//                   baseCurrency: i
//                     .toFiat(baseCurrency)
//                     .toDisplayStringWithSymbol(2),
//                 })),
//               }
//             : undefined,
//         accruedInterest: formatCryptoWithFiat(
//           baseCurrency,
//           totalInterestAccrual
//         ),
//         marketPNL: formatCryptoWithFiat(baseCurrency, marketProfitLoss),
//         feesPaid: formatCryptoWithFiat(baseCurrency, totalILAndFees),
//         totalEarnings: formatCryptoWithFiat(
//           baseCurrency,
//           totalEarningsWithIncentives
//         ),
//       };
//     }
//   );

//   const detailedTotals = holdings
//     .map(
//       ({
//         totalIncentiveEarnings,
//         statement,
//         marketProfitLoss,
//         totalEarningsWithIncentives,
//       }) => {
//         return {
//           incentivesEarnings: totalIncentiveEarnings
//             ? totalIncentiveEarnings.toFiat(baseCurrency).toFloat()
//             : 0,
//           accruedInterest:
//             statement?.totalInterestAccrual?.toFiat(baseCurrency).toFloat() ||
//             0,
//           marketPNL: marketProfitLoss?.toFiat(baseCurrency).toFloat() || 0,
//           feesPaid:
//             statement?.totalILAndFees?.toFiat(baseCurrency).toFloat() || 0,
//           totalEarnings:
//             totalEarningsWithIncentives?.toFiat(baseCurrency).toFloat() || 0,
//         };
//       }
//     )
//     .reduce(
//       (accumulator, current) => {
//         accumulator.incentivesEarnings += current.incentivesEarnings || 0;
//         accumulator.accruedInterest += current.accruedInterest || 0;
//         accumulator.marketPNL += current.marketPNL || 0;
//         accumulator.feesPaid += current.feesPaid || 0;
//         accumulator.totalEarnings += current.totalEarnings || 0;
//         return accumulator;
//       },
//       {
//         incentivesEarnings: 0,
//         accruedInterest: 0,
//         marketPNL: 0,
//         feesPaid: 0,
//         totalEarnings: 0,
//       }
//     );

//   const detailedEarnings = holdings
//     .map(
//       ({
//         balance: b,
//         statement,
//         perIncentiveEarnings,
//         totalIncentiveEarnings,
//         totalEarningsWithIncentives,
//         marketProfitLoss,
//       }) => {
//         const isDebt = b.isNegative();
//         const { icon, formattedTitle, titleWithMaturity } = formatTokenType(
//           b.token,
//           isDebt
//         );

//         const incentivesEarningsData =
//           b.tokenType === 'nToken'
//             ? totalIncentiveEarnings
//               ? totalIncentiveEarnings
//                   ?.toFiat(baseCurrency)
//                   .toDisplayStringWithSymbol(2)
//               : `${FiatSymbols[baseCurrency]}0.00`
//             : '-';

//         const marketPNLData =
//           b.tokenType !== 'PrimeCash' && b.tokenType !== 'PrimeDebt'
//             ? marketProfitLoss
//                 ?.toFiat(baseCurrency)
//                 .toDisplayStringWithSymbol(2)
//             : '-';

//         const feeData =
//           b.tokenType !== 'PrimeCash' && b.tokenType !== 'PrimeDebt'
//             ? formatCryptoWithFiat(baseCurrency, statement?.totalILAndFees, {
//                 showZero: true,
//               })
//             : '-';

//         return {
//           asset: {
//             symbol: icon,
//             symbolBottom: '',
//             label: formattedTitle,
//             caption: titleWithMaturity,
//           },
//           isDebt,
//           tokenId: b.tokenId,
//           // TODO: use formatCryptoWithFiat once data is ready
//           incentivesEarnings: {
//             data: [
//               {
//                 displayValue: incentivesEarningsData,
//                 isNegative: false,
//               },
//               {
//                 displayValue: '',
//                 isNegative: false,
//               },
//             ],
//           },
//           toolTipData:
//             perIncentiveEarnings.length > 0
//               ? {
//                   perAssetEarnings: perIncentiveEarnings?.map((i) => ({
//                     underlying: i.toDisplayStringWithSymbol(2),
//                     baseCurrency: i
//                       .toFiat(baseCurrency)
//                       .toDisplayStringWithSymbol(2),
//                   })),
//                 }
//               : undefined,
//           accruedInterest: formatCryptoWithFiat(
//             baseCurrency,
//             statement?.totalInterestAccrual,
//             { showZero: true }
//           ),
//           marketPNL: {
//             data: [
//               {
//                 displayValue: marketPNLData,
//                 isNegative: false,
//               },
//               {
//                 displayValue: '',
//                 isNegative: false,
//               },
//             ],
//           },
//           feesPaid: feeData,
//           // TODO: use formatCryptoWithFiat once data is ready
//           totalEarnings: {
//             data: [
//               {
//                 displayValue: totalEarningsWithIncentives
//                   ? totalEarningsWithIncentives
//                       ?.toFiat(baseCurrency)
//                       .toDisplayStringWithSymbol(2)
//                   : `${FiatSymbols[baseCurrency]}0.00`,
//                 isNegative: false,
//               },
//               {
//                 displayValue: '',
//                 isNegative: false,
//               },
//             ],
//           },
//         };
//       }
//     )
//     .sort((a, b) => {
//       if (a.isDebt && !b.isDebt) {
//         return 1;
//       }
//       if (!a.isDebt && b.isDebt) {
//         return -1;
//       }
//       return 0;
//     });

//   detailedEarnings.push({
//     asset: {
//       symbol: '',
//       symbolBottom: '',
//       label: 'Total',
//       caption: '',
//     },
//     incentivesEarnings: formatNumberAsAbbr(
//       detailedTotals.incentivesEarnings,
//       2,
//       baseCurrency
//     ),
//     accruedInterest: formatNumberAsAbbr(
//       detailedTotals.accruedInterest,
//       2,
//       baseCurrency
//     ),
//     marketPNL: formatNumberAsAbbr(detailedTotals.marketPNL, 2, baseCurrency),
//     feesPaid: formatNumberAsAbbr(detailedTotals.feesPaid, 2, baseCurrency),
//     totalEarnings: formatNumberAsAbbr(
//       detailedTotals.totalEarnings,
//       2,
//       baseCurrency
//     ),
//     actionRow: undefined,
//     tokenId: ' ',
//     isTotalRow: true,
//   } as unknown as (typeof detailedEarnings)[number]);

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

//   const groupedTokens = groupedHoldings.flatMap(({ asset, debt }) => [
//     asset.balance.tokenId,
//     debt.balance.tokenId,
//   ]);

//   const earningsBreakdownData = isGrouped
//     ? [
//         ...groupedEarnings,
//         ...detailedEarnings.filter(
//           ({ tokenId }) => !groupedTokens.includes(tokenId)
//         ),
//       ]
//     : detailedEarnings;

//   return {
//     earningsBreakdownColumns: Columns,
//     earningsBreakdownData: insertDebtDivider(earningsBreakdownData),
//     setExpandedRows,
//     initialState: { clickDisabled: true },
//   };
// }
