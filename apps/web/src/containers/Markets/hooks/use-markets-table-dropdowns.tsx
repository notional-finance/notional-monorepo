import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  PieChartIcon,
  BarChartIcon,
  BarChartLateralIcon,
  // BarCharLightningIcon,
  VaultIcon,
  CoinsIcon,
  CoinsCircleIcon,
} from '@notional-finance/icons';
import { Network } from '@notional-finance/util';
import { TokenIcon } from '@notional-finance/icons';
import { useAllUniqueUnderlyingTokens } from '@notional-finance/notionable-hooks';
import { useTheme } from '@mui/material';

const selectedNetworkOptions = {
  0: [Network.arbitrum, Network.mainnet],
  1: [Network.arbitrum],
  2: [Network.mainnet],
};

export const useMarketTableDropdowns = (
  earnBorrowOption: number,
  allNetworksOption: number
) => {
  const theme = useTheme();
  const depositTokens = useAllUniqueUnderlyingTokens(
    selectedNetworkOptions[allNetworksOption]
  );

  console.log(
    'selectedNetworkOptions[allNetworksOption]: ',
    selectedNetworkOptions[allNetworksOption]
  );
  console.log({ depositTokens });
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  useEffect(() => {
    setProductOptions([]);
    setCurrencyOptions([]);
  }, [earnBorrowOption, allNetworksOption]);

  const products = {
    0: [
      {
        id: 'Fixed Lend',
        title: 'Fixed Lend',
        icon: (
          <BarChartLateralIcon
            sx={{
              fontSize: theme.spacing(2),
              fill: theme.palette.common.black,
            }}
          />
        ),
      },
      {
        id: 'Variable Lend',
        title: 'Variable Lend',
        icon: (
          <BarChartIcon
            sx={{
              fontSize: theme.spacing(2),
              fill: theme.palette.common.black,
            }}
          />
        ),
      },
      {
        id: 'Provide Liquidity',
        title: 'Provide Liquidity',
        icon: (
          <PieChartIcon
            sx={{
              fontSize: theme.spacing(2),
              stroke: 'transparent',
              fill: theme.palette.common.black,
            }}
          />
        ),
      },
      {
        id: 'Leveraged Vault',
        title: 'Leveraged Vault',
        icon: (
          <VaultIcon
            sx={{
              fontSize: theme.spacing(2),
              fill: theme.palette.common.black,
            }}
          />
        ),
      },
      {
        id: 'Leveraged Liquidity',
        title: 'Leveraged Liquidity',
        icon: (
          <PieChartIcon
            sx={{
              fontSize: theme.spacing(2),
              stroke: 'transparent',
              fill: theme.palette.common.black,
            }}
          />
        ),
      },
    ],
    1: [
      {
        id: 'Fixed Borrow',
        title: 'Fixed Borrow',
        icon: (
          <CoinsIcon
            sx={{
              fontSize: theme.spacing(2),
              fill: 'transparent',
              stroke: theme.palette.common.black,
            }}
          />
        ),
      },
      {
        id: 'Variable Borrow',
        title: 'Variable Borrow',
        icon: (
          <CoinsCircleIcon
            sx={{
              fontSize: theme.spacing(2),
              fill: theme.palette.common.black,
              stroke: 'transparent',
            }}
          />
        ),
      },
    ],
  };

  const underlyingTokens = depositTokens.map((symbol) => ({
    id: symbol,
    title: symbol,
    icon: <TokenIcon size="medium" symbol={symbol.toLocaleLowerCase()} />,
  }));

  const dropdownsData = [
    {
      selectedOptions: currencyOptions,
      setSelectedOptions: setCurrencyOptions,
      placeHolderText: <FormattedMessage defaultMessage={'Currency'} />,
      data: underlyingTokens,
    },
    {
      selectedOptions: productOptions,
      setSelectedOptions: setProductOptions,
      placeHolderText: <FormattedMessage defaultMessage={'Products'} />,
      data: products[earnBorrowOption],
    },
  ];

  return { dropdownsData, currencyOptions, productOptions };
};

export default useMarketTableDropdowns;
