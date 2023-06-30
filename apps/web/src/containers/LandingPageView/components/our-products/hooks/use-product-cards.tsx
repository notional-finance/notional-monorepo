import { FormattedMessage } from 'react-intl';
import { colors } from '@notional-finance/styles';
import { Box } from '@mui/material';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useProductCards = () => {
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
      text: (
        <FormattedMessage
          defaultMessage={'Choose a term and get a guaranteed interest rate.'}
        />
      ),
      apy: `${formatNumberAsPercent(fCashLend?.totalApy || 0)} APY`,
      symbol: fCashLend?.underlying,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: fCashLend === null,
    },
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
      apy: `${formatNumberAsPercent(leveragedVaults?.totalApy || 0)} APY`,
      symbol: leveragedVaults?.underlying,
      groupedSymbols: 'eth_dai_usdc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: leveragedVaults === null,
      variableRate: true,
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Rate Lending'} />,
      link: '',
      href: 'https://blog.notional.finance/introducing-notional-v3/',
      text: (
        <FormattedMessage
          defaultMessage={`Earn passive interest. Withdraw anytime.
          <span>Read more about Notional V3 on the blog</span>`}
          values={{
            span: (chunk: React.ReactNode) => (
              <Box sx={{ color: colors.neonTurquoise }} component="span">
                {chunk}
              </Box>
            ),
          }}
        />
      ),
      apy: `${formatNumberAsPercent(variableLend?.totalApy || 0)} APY`,
      symbol: variableLend?.underlying,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: variableLend === null,
      variableRate: true,
      comingSoon: true,
    },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      link: '/provide',
      text: (
        <FormattedMessage
          defaultMessage={`Earn NOTE incentives, interest, and trading fees from Notional's liquidity pools.`}
        />
      ),
      apy: `${formatNumberAsPercent(liquidity?.totalApy || 0)} APY`,
      symbol: liquidity?.underlying,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: liquidity === null,
      variableRate: true,
    },
  ];

  const borrowData = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Borrow'} />,
      link: '/borrow',
      text: (
        <FormattedMessage
          defaultMessage={'Choose a term and get a guaranteed interest rate.'}
        />
      ),
      apy: `${formatNumberAsPercent(fCashBorrow?.totalApy || 0)} APY`,
      symbol: fCashBorrow?.underlying,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as low as'} />,
      loading: fCashBorrow === null,
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Borrow'} />,
      link: '',
      href: 'https://blog.notional.finance/introducing-notional-v3/',
      text: (
        <FormattedMessage
          defaultMessage={`Keep your options open. Pay a variable interest rate and close out your debt whenever you want for no penalty.
          <span>Read more about Notional V3 on the blog.</span>`}
          values={{
            span: (chunk: React.ReactNode) => (
              <Box sx={{ color: colors.neonTurquoise }} component="span">
                {chunk}
              </Box>
            ),
          }}
        />
      ),
      apy: `${formatNumberAsPercent(variableBorrow?.totalApy || 0)} APY`,
      symbol: variableBorrow?.underlying,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as low as'} />,
      loading: variableBorrow === null,
      variableRate: true,
      comingSoon: true,
    },
  ];
  return { earnYieldData, borrowData };
};

export default useProductCards;
