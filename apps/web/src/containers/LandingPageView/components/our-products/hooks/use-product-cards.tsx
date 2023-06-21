import { FormattedMessage } from 'react-intl';
import { useVaultMaxRate } from './use-vault-max-rate';
import { useProvideLiquidityMaxRate } from './use-provide-liquidity-max-rate';
import { useLendBorrowRates } from './use-lend-borrow-rates';
import { colors } from '@notional-finance/styles';
import { Box } from '@mui/material';

export const useProductCards = () => {
  const { maxVaultRateData, vaultDataloading } = useVaultMaxRate();
  const { maxRateProvideLiquidityData, provideLiquidityLoading } =
    useProvideLiquidityMaxRate();
  const {
    maxFixedLendRateData,
    minFixedBorrowRateData,
    lendBorrowFixedLoading,
  } = useLendBorrowRates();

  const earnYieldData = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      link: '/lend-fixed',
      text: (
        <FormattedMessage
          defaultMessage={'Choose a term and get a guaranteed interest rate.'}
        />
      ),
      apy: `${maxFixedLendRateData.maxRate} APY`,
      symbol: maxFixedLendRateData.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: lendBorrowFixedLoading,
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
      apy: `${maxVaultRateData.maxRate} APY`,
      symbol: maxVaultRateData.symbol,
      groupedSymbols: 'eth_dai_usdc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: vaultDataloading,
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
      apy: '0% APY',
      symbol: 'eth',
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: false,
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
      apy: `${maxRateProvideLiquidityData.maxRate} APY`,
      symbol: maxRateProvideLiquidityData.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
      loading: provideLiquidityLoading,
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
      apy: `${minFixedBorrowRateData.minRate} APY`,
      symbol: minFixedBorrowRateData.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as low as'} />,
      loading: lendBorrowFixedLoading,
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
      apy: '6.89% APY',
      symbol: 'eth',
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as low as'} />,
      loading: false,
      variableRate: true,
      comingSoon: true,
    },
  ];
  return { earnYieldData, borrowData };
};

export default useProductCards;
