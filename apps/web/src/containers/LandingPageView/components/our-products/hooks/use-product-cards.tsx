import { FormattedMessage } from 'react-intl';
import { useVaultMaxRate } from './use-vault-max-rate';
import { useProvideLiquidityMaxRate } from './use-provide-liquidity-max-rate';
import { useLendBorrowRates } from './use-lend-borrow-rates';

export const useProductCards = () => {
  const maxVaultRateData = useVaultMaxRate();
  const maxRateProvideLiquidityData = useProvideLiquidityMaxRate();
  const { maxFixedLendRateData, minFixedBorrowRateData } = useLendBorrowRates();

  const earnYieldData = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      link: '/lend',
      text: (
        <FormattedMessage
          defaultMessage={'Choose a term and get a guaranteed interest rate.'}
        />
      ),
      apy: `${maxFixedLendRateData.maxRate} APY`,
      symbol: maxFixedLendRateData.symbol,
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
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
      variableRate: true,
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Rate Lending'} />,
      link: '',
      text: (
        <FormattedMessage
          defaultMessage={`Earn passive interest. Withdraw anytime.
          Read more about Notional V3 on the blog`}
        />
      ),
      apy: '0% APY',
      symbol: 'eth',
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as high as'} />,
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
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Borrow'} />,
      link: '',
      text: (
        <FormattedMessage
          defaultMessage={'Choose a term and get a guaranteed interest rate.'}
        />
      ),
      apy: '6.89% APY',
      symbol: 'eth',
      groupedSymbols: 'eth_dai_usdc_wbtc',
      apyTitle: <FormattedMessage defaultMessage={'as low as'} />,
      variableRate: true,
      comingSoon: true,
    },
  ];
  return { earnYieldData, borrowData };
};

export default useProductCards;
