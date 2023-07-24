import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
// import {
//   PieChartIcon,
//   BarChartIcon,
//   BarChartLateralIcon,
//   BarCharLightningIcon,
//   VaultIcon,
//   CoinsIcon,
//   CoinsCircleIcon,
// } from '@notional-finance/icons';
import { TXN_HISTORY_TYPE } from '@notional-finance/shared-config';
import { TokenIcon } from '@notional-finance/icons';
import { useTransactionHistory } from '@notional-finance/notionable-hooks';
// import { useTheme } from '@mui/material';

export const useTxnHistoryDropdowns = (txnHistoryType) => {
  // const theme = useTheme();
  const accountHistory = useTransactionHistory();
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);

  useEffect(() => {
    setAssetOptions([]);
    setCurrencyOptions([]);
  }, [txnHistoryType]);

  // const txnHistoryFilterTypes = {
  //   [TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS]: [
  //     {
  //       id: '1',
  //       title: 'Fixed Lend',
  //       icon: (
  //         <BarChartLateralIcon
  //           sx={{
  //             fontSize: theme.spacing(2),
  //             fill: theme.palette.common.black,
  //           }}
  //         />
  //       ),
  //     },
  //     {
  //       id: '2',
  //       title: 'Variable Lend',
  //       icon: (
  //         <BarChartIcon
  //           sx={{
  //             fontSize: theme.spacing(2),
  //             fill: theme.palette.common.black,
  //           }}
  //         />
  //       ),
  //     },
  //     {
  //       id: '3',
  //       title: 'Provide Liquidity',
  //       icon: (
  //         <PieChartIcon
  //           sx={{
  //             fontSize: theme.spacing(2),
  //             stroke: 'transparent',
  //             fill: theme.palette.common.black,
  //           }}
  //         />
  //       ),
  //     },
  //     {
  //       id: '4',
  //       title: 'Leveraged Vault',
  //       icon: (
  //         <VaultIcon
  //           sx={{
  //             fontSize: theme.spacing(2),
  //             fill: theme.palette.common.black,
  //           }}
  //         />
  //       ),
  //     },
  //     {
  //       id: '5',
  //       title: 'Leveraged Lend',
  //       icon: (
  //         <BarCharLightningIcon
  //           sx={{
  //             fontSize: theme.spacing(2),
  //             fill: theme.palette.common.black,
  //           }}
  //         />
  //       ),
  //     },
  //     {
  //       id: '6',
  //       title: 'Leveraged Liquidity',
  //       icon: (
  //         <PieChartIcon
  //           sx={{
  //             fontSize: theme.spacing(2),
  //             stroke: 'transparent',
  //             fill: theme.palette.common.black,
  //           }}
  //         />
  //       ),
  //     },
  //   ],
  //   [TXN_HISTORY_TYPE.LEVERAGED_VAULT]: [
  //     {
  //       id: '1',
  //       title: 'Fixed Borrow',
  //       icon: (
  //         <CoinsIcon
  //           sx={{
  //             fontSize: theme.spacing(2),
  //             fill: 'transparent',
  //             stroke: theme.palette.common.black,
  //           }}
  //         />
  //       ),
  //     },
  //     {
  //       id: '2',
  //       title: 'Variable Borrow',
  //       icon: (
  //         <CoinsCircleIcon
  //           sx={{
  //             fontSize: theme.spacing(2),
  //             fill: theme.palette.common.black,
  //             stroke: 'transparent',
  //           }}
  //         />
  //       ),
  //     },
  //   ],
  // };

  const currencyData = accountHistory.map(({ underlying }, index) => ({
    id: index.toString(),
    title: underlying.symbol,
    icon: (
      <TokenIcon size="medium" symbol={underlying.symbol.toLocaleLowerCase()} />
    ),
  }));

  const removeDuplicateObjects = (currencyData) => {
    const uniqueObjects = {};
    const filteredArray = currencyData.filter(({ title }) => {
      if (!uniqueObjects[title]) {
        uniqueObjects[title] = true;
        return true;
      }
      return false;
    });

    return filteredArray;
  };
  const dataSetOne = removeDuplicateObjects(currencyData);

  const dropdownsData = [
    {
      selectedOptions: currencyOptions,
      setSelectedOptions: setCurrencyOptions,
      data: dataSetOne,
      placeHolderText: <FormattedMessage defaultMessage={'Currency'} />,
    },
    // {
    //   selectedOptions: assetOptions,
    //   setSelectedOptions: setAssetOptions,
    //   placeHolderText: <FormattedMessage defaultMessage={'Products'} />,
    //   data: products[txnHistoryType],
    // },
  ];

  return { dropdownsData, currencyOptions, assetOptions };
};

export default useTxnHistoryDropdowns;
