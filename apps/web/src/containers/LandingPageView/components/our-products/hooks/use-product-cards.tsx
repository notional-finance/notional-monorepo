import { FormattedMessage } from 'react-intl';
import { useHeadlineRates } from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useProductCards = () => {
  const {
    fCashLend,
    variableLend,
    leveragedVaults,
    leveragedLiquidity,
    liquidity,
    variableBorrow,
  } = useHeadlineRates();

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
      network: fCashLend?.token.network,
    },
    {
      title: <FormattedMessage defaultMessage={'Lending'} />,
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
      network: variableLend?.token.network,
    },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      link: '/liquidity-variable',
      text: (
        <FormattedMessage
          defaultMessage={`Earn incentives, interest, and trading fees from Notional's liquidity pools.`}
        />
      ),
      apy: `${formatNumberAsPercent(liquidity?.totalAPY || 0)} APY`,
      symbol: liquidity?.underlying.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: liquidity === null,
      network: liquidity?.token.network,
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
      isLeveraged: true,
      network: leveragedVaults?.token.network,
    },
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
      isLeveraged: true,
      network: leveragedLiquidity?.token.network,
    },
    {
      title: <FormattedMessage defaultMessage={'Borrow'} />,
      link: '/borrow-fixed',
      text: (
        <FormattedMessage
          defaultMessage={'Borrow at fixed or variable rates.'}
        />
      ),
      apy: `${formatNumberAsPercent(variableBorrow?.totalAPY || 0)} APY`,
      symbol: variableBorrow?.underlying.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as low as'} />,
      loading: variableBorrow === null,
      network: variableBorrow?.token.network,
    },
  ];

  return { earnYieldData, leveragedYieldData };
};

export default useProductCards;
