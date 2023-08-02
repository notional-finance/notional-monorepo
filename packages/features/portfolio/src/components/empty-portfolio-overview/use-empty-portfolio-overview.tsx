import { FormattedMessage } from 'react-intl';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useEmptyPortfolioOverview = () => {
  const {
    headlineRates: {
      fCashLend,
      variableLend,
      leveragedVaults,
      liquidity,
      fCashBorrow,
      variableBorrow,
    },
  } = useAllMarkets();

  const earnYieldData = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      link: '/lend-fixed',
      apy: `${formatNumberAsPercent(fCashLend?.totalAPY || 0)}`,
      symbol: fCashLend?.underlying.symbol,
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      link: '/vaults',
      apy: `${formatNumberAsPercent(leveragedVaults?.totalAPY || 0)}`,
      symbol: leveragedVaults?.underlying.symbol,
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Rate Lending'} />,
      link: '',
      apy: `${formatNumberAsPercent(variableLend?.totalAPY || 0)}`,
      symbol: variableLend?.underlying.symbol,
    },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      link: '/liquidity-variable',
      apy: `${formatNumberAsPercent(liquidity?.totalAPY || 0)}`,
      symbol: liquidity?.underlying.symbol,
    },
  ];

  const borrowData = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Borrow'} />,
      link: '/borrow-fixed',
      apy: `${formatNumberAsPercent(fCashBorrow?.totalAPY || 0)}`,
      symbol: fCashBorrow?.underlying.symbol,
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Borrow'} />,
      link: '/borrow-variable',
      apy: `${formatNumberAsPercent(variableBorrow?.totalAPY || 0)}`,
      symbol: variableBorrow?.underlying.symbol,
    },
  ];
  return { earnYieldData, borrowData };
};

export default useEmptyPortfolioOverview;
