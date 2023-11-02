import { FormattedMessage } from 'react-intl';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useProductCards = () => {
  const {
    headlineRates: {
      fCashLend,
      variableLend,
      leveragedVaults,
      leveragedLiquidity,
      // leveragedLend,
      liquidity,
      fCashBorrow,
      variableBorrow,
    },
  } = useAllMarkets();

  const earnYieldData = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      link: '/lend-fixed',
      text: (
        <FormattedMessage
          defaultMessage={'Choose a term and get a guaranteed interest rate.'}
        />
      ),
      apy: `${formatNumberAsPercent(fCashLend?.totalAPY || 0)} APY`,
      symbol: fCashLend?.underlying.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: fCashLend === null,
      fixedRate: true,
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Rate Lending'} />,
      link: 'lend-variable',
      text: (
        <FormattedMessage
          defaultMessage={`Earn passive interest. Withdraw anytime.`}
        />
      ),
      apy: `${formatNumberAsPercent(variableLend?.totalAPY || 0)} APY`,
      symbol: variableLend?.underlying.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: variableLend === null,
    },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      link: '/liquidity-variable',
      text: (
        <FormattedMessage
          defaultMessage={`Earn NOTE incentives, interest, and trading fees from Notional's liquidity pools.`}
        />
      ),
      apy: `${formatNumberAsPercent(liquidity?.totalAPY || 0)} APY`,
      symbol: liquidity?.underlying.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: liquidity === null,
    },
  ];

  const leveragedYieldData = [
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      link: '/vaults',
      text: (
        <FormattedMessage
          defaultMessage={
            'Maximize your returns with leveraged DeFi yield strategies.'
          }
        />
      ),
      apy: `${formatNumberAsPercent(leveragedVaults?.totalAPY || 0)} APY`,
      symbol: leveragedVaults?.underlying.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: leveragedVaults === null,
    },
    // {
    //   title: <FormattedMessage defaultMessage={'Leveraged Lending'} />,
    //   link: '/lend-leveraged',
    //   text: (
    //     <FormattedMessage
    //       defaultMessage={`Arbitrage Notional's interest rates by borrowing from one maturity and lending to another with leverage.`}
    //     />
    //   ),
    //   apy: `${formatNumberAsPercent(leveragedLend?.totalAPY || 0)} APY`,
    //   symbol: leveragedLend?.underlying.symbol,
    //   groupedSymbols: 'eth_dai_usdc_wbtc',
    //   apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
    //   loading: leveragedLend === null,
    // },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      link: '/liquidity-leveraged',
      text: (
        <FormattedMessage
          defaultMessage={`Multiply your yield by providing liquidity with leverage.`}
        />
      ),
      apy: `${formatNumberAsPercent(leveragedLiquidity?.totalAPY || 0)} APY`,
      symbol: leveragedLiquidity?.underlying.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: leveragedLiquidity === null,
    },
  ];

  const borrowData = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Borrow'} />,
      link: '/borrow-fixed',
      text: (
        <FormattedMessage
          defaultMessage={'Choose a term and get a guaranteed interest rate.'}
        />
      ),
      apy: `${formatNumberAsPercent(fCashBorrow?.totalAPY || 0)} APY`,
      symbol: fCashBorrow?.underlying.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as low as'} />,
      loading: fCashBorrow === null,
      fixedRate: true,
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Borrow'} />,
      link: '/borrow-variable',
      text: (
        <FormattedMessage
          defaultMessage={`Pay a variable interest rate and close out your debt at any time for no penalty.`}
        />
      ),
      apy: `${formatNumberAsPercent(variableBorrow?.totalAPY || 0)} APY`,
      symbol: variableBorrow?.underlying.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as low as'} />,
      loading: variableBorrow === null,
    },
  ];
  return { earnYieldData, borrowData, leveragedYieldData };
};

export default useProductCards;
