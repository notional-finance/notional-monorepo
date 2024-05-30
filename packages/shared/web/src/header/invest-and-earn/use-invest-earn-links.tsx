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
import { useHeadlineRates } from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { useDefaultNetwork } from '../use-default-network';

export const usePendingValues = (value: number | undefined) => {
  const theme = useTheme();
  return value !== undefined ? (
    formatNumberAsPercent(value)
  ) : (
    <ProgressIndicator
      type="linear"
      sx={{
        width: theme.spacing(5),
        margin: 'auto 5px',
        color: theme.palette.typography.light,
      }}
    />
  );
};

export const useInvestEarnLinks = () => {
  const theme = useTheme();
  const selectedNetwork = useDefaultNetwork();

  const {
    fCashLend,
    liquidity,
    leveragedVaults,
    variableLend,
    leveragedLiquidity,
  } = useHeadlineRates();

  const lowRiskLinks: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      to: `/lend-fixed/${selectedNetwork}`,
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
            rate: usePendingValues(fCashLend?.totalAPY),
          }}
        />
      ),

      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Rate Lending'} />,
      to: `/lend-variable/${selectedNetwork}`,
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
            rate: usePendingValues(variableLend?.totalAPY),
          }}
        />
      ),
      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      to: `/liquidity-variable/${selectedNetwork}`,
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
            rate: usePendingValues(liquidity?.totalAPY),
          }}
        />
      ),
      external: false,
    },
    // {
    //   title: <FormattedMessage defaultMessage={'NOTE Staking'} />,
    //   to: '/stake/ETH',
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
      to: `/vaults/${selectedNetwork}`,
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
            rate: usePendingValues(leveragedVaults?.totalAPY),
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
      to: `/liquidity-leveraged/${selectedNetwork}`,
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
            rate: usePendingValues(leveragedLiquidity?.totalAPY),
          }}
        />
      ),
      external: false,
    },
  ];
  return { lowRiskLinks, highYieldLinks };
};
