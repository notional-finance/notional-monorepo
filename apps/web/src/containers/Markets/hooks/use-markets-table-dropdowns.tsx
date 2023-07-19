import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  PieChartIcon,
  BarChartIcon,
  BarChartLateralIcon,
  BarCharLightningIcon,
  VaultIcon,
  CoinsIcon,
  CoinsCircleIcon,
} from '@notional-finance/icons';
import { MARKET_TYPE } from '@notional-finance/shared-config';
import { TokenIcon } from '@notional-finance/icons';
import { useCurrency } from '@notional-finance/notionable-hooks';
import { useTheme } from '@mui/material';

export const useMarketTableDropdowns = (marketType) => {
  const theme = useTheme();
  const { depositTokens } = useCurrency();
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  useEffect(() => {
    setProductOptions([]);
    setCurrencyOptions([]);
  }, [marketType]);

  const products = {
    [MARKET_TYPE.EARN]: [
      {
        id: '1',
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
        id: '2',
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
        id: '3',
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
        id: '4',
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
        id: '5',
        title: 'Leveraged Lend',
        icon: (
          <BarCharLightningIcon
            sx={{
              fontSize: theme.spacing(2),
              fill: theme.palette.common.black,
            }}
          />
        ),
      },
      {
        id: '6',
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
    [MARKET_TYPE.BORROW]: [
      {
        id: '1',
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
        id: '2',
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

  const dataSetOne = depositTokens.map(({ symbol }, index) => ({
    id: index.toString(),
    title: symbol,
    icon: <TokenIcon size="medium" symbol={symbol.toLocaleLowerCase()} />,
  }));

  const dropdownsData = [
    {
      selectedOptions: currencyOptions,
      setSelectedOptions: setCurrencyOptions,
      data: dataSetOne,
      placeHolderText: <FormattedMessage defaultMessage={'Currency'} />,
    },
    {
      selectedOptions: productOptions,
      setSelectedOptions: setProductOptions,
      placeHolderText: <FormattedMessage defaultMessage={'Products'} />,
      data: products[marketType],
    },
  ];

  return { dropdownsData, currencyOptions, productOptions };
};

export default useMarketTableDropdowns;
