import { SectionLinkProps, ProgressIndicator } from '@notional-finance/mui';
import { useTheme } from '@mui/material';
import {
  PieChartIcon,
  BarChartIcon,
  BarChartLateralIcon,
  // BarCharLightningIcon,
  // StakeIcon,
  VaultIcon,
} from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { Network } from '@notional-finance/util';

export const useInvestEarnLinks = () => {
  const theme = useTheme();
  const {
    headlineRates: {
      fCashLend,
      liquidity,
      leveragedVaults,
      variableLend,
      // leveragedLend,
      leveragedLiquidity,
    },
  } = useAllMarkets(Network.ArbitrumOne);

  const lowRiskLinks: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      to: '/lend-fixed',
      icon: (
        <BarChartLateralIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage="Earn up to {rate} APY"
          values={{
            rate: fCashLend?.totalAPY ? (
              formatNumberAsPercent(fCashLend?.totalAPY)
            ) : (
              <ProgressIndicator
                type="linear"
                sx={{
                  width: theme.spacing(5),
                  margin: 'auto 5px',
                  color: theme.palette.typography.light,
                }}
              />
            ),
          }}
        />
      ),

      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Rate Lending'} />,
      to: '/lend-variable',
      icon: (
        <BarChartIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage="Earn up to {rate} variable APY"
          values={{
            rate: variableLend?.totalAPY ? (
              formatNumberAsPercent(variableLend?.totalAPY)
            ) : (
              <ProgressIndicator
                type="linear"
                sx={{
                  width: theme.spacing(5),
                  margin: 'auto 5px',
                  color: theme.palette.typography.light,
                }}
              />
            ),
          }}
        />
      ),
      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      to: '/liquidity-variable',
      icon: (
        <PieChartIcon
          sx={{
            fontSize: theme.spacing(3),
            stroke: 'transparent',
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={'Earn up to {rate} variable APY'}
          values={{
            rate: liquidity?.totalAPY ? (
              formatNumberAsPercent(liquidity?.totalAPY)
            ) : (
              <ProgressIndicator
                type="linear"
                sx={{
                  width: theme.spacing(5),
                  margin: 'auto 5px',
                  color: theme.palette.typography.light,
                }}
              />
            ),
          }}
        />
      ),
      external: false,
    },
    // {
    //   title: <FormattedMessage defaultMessage={'NOTE Staking'} />,
    //   to: '/stake',
    //   icon: (
    //     <StakeIcon
    //       sx={{
    //         fontSize: theme.spacing(3),
    //         stroke: theme.palette.common.black,
    //         fill: 'transparent',
    //       }}
    //     />
    //   ),
    //   description: (
    //     <FormattedMessage
    //       defaultMessage={'Stake NOTE and earn protocol revenues.'}
    //     />
    //   ),
    //   external: false,
    // },
  ];

  const highYieldLinks: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      to: '/vaults',
      icon: (
        <VaultIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={'Leverage DeFi yields and earn up to {rate} APY'}
          values={{
            rate: leveragedVaults?.totalAPY ? (
              formatNumberAsPercent(leveragedVaults?.totalAPY)
            ) : (
              <ProgressIndicator
                type="linear"
                sx={{
                  width: theme.spacing(5),
                  margin: 'auto 5px',
                  color: theme.palette.typography.light,
                }}
              />
            ),
          }}
        />
      ),
      external: false,
    },
    // {
    //   title: <FormattedMessage defaultMessage={'Leveraged Lending'} />,
    //   to: '/lend-leveraged',
    //   icon: (
    //     <BarCharLightningIcon
    //       sx={{
    //         fontSize: theme.spacing(3),
    //         fill: theme.palette.common.black,
    //       }}
    //     />
    //   ),
    //   description: (
    //     <FormattedMessage
    //       defaultMessage={'Lend with leverage and earn up to {rate} APY'}
    //       values={{
    //         rate: formatNumberAsPercent(leveragedLend?.totalAPY || 0),
    //       }}
    //     />
    //   ),
    //   external: false,
    // },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      to: '/liquidity-leveraged',
      icon: (
        <PieChartIcon
          sx={{
            fontSize: theme.spacing(3),
            stroke: 'transparent',
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={'Leverage liquidity and earn up to {rate} APY'}
          values={{
            rate: leveragedLiquidity?.totalAPY ? (
              formatNumberAsPercent(leveragedLiquidity?.totalAPY)
            ) : (
              <ProgressIndicator
                type="linear"
                sx={{
                  width: theme.spacing(5),
                  margin: 'auto 5px',
                  color: theme.palette.typography.light,
                }}
              />
            ),
          }}
        />
      ),
      external: false,
    },
  ];
  return { lowRiskLinks, highYieldLinks };
};
