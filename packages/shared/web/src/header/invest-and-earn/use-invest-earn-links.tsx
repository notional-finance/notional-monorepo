import { SectionLinkProps } from '@notional-finance/mui';
import { useTheme } from '@mui/material';
import {
  PieChartIcon,
  BarChartIcon,
  BarChartLateralIcon,
  BarCharLightningIcon,
  StakeIcon,
  VaultIcon,
} from '@notional-finance/icons';
import { useInvestEarnYields } from './use-invest-earn-yields';
import { FormattedMessage } from 'react-intl';

export const useInvestEarnLinks = () => {
  const theme = useTheme();
  const { highestLendRate, highestNTokenRate, highestVaultApy } =
    useInvestEarnYields();

  // TODO: Add real leveraged and variable rate data when available.
  // TODO: Add links to leveraged card pages after those are created

  const lowRiskLinks: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      to: '/lend-fixed',
      icon: (
        <BarChartLateralIcon
          sx={{
            fontSize: '1.5rem',
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage="Earn up to {rate} APY"
          values={{
            rate: highestLendRate,
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
            fontSize: '1.5rem',
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage="Earn up to {rate} variable APY"
          values={{
            rate: '4.15%',
          }}
        />
      ),
      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      to: '/provide',
      icon: (
        <PieChartIcon
          sx={{
            fontSize: '1.5rem',
            stroke: 'transparent',
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={'Earn up to {rate} variable APY'}
          values={{
            rate: highestNTokenRate,
          }}
        />
      ),
      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'NOTE Staking'} />,
      to: '/stake',
      icon: (
        <StakeIcon
          sx={{
            fontSize: '1.5rem',
            stroke: theme.palette.common.black,
            fill: 'transparent',
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={'Stake NOTE and earn protocol revenues.'}
        />
      ),
      external: false,
    },
  ];

  const highYieldLinks: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      to: '/vaults',
      icon: (
        <VaultIcon
          sx={{
            fontSize: '1.5rem',
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={'Leverage DeFi yields and earn up to {rate} APY'}
          values={{
            rate: highestVaultApy,
          }}
        />
      ),
      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Lending'} />,
      to: '/lend-leveraged',
      icon: (
        <BarCharLightningIcon
          sx={{
            fontSize: '1.5rem',
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={'Lend with leverage and earn up to 24.60% APY'}
        />
      ),
      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      to: '/liquidity-leveraged',
      icon: (
        <PieChartIcon
          sx={{
            fontSize: '1.5rem',
            stroke: 'transparent',
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={'Leverage liquidity and earn up to 22.40% APY'}
        />
      ),
      external: false,
    },
  ];
  return { lowRiskLinks, highYieldLinks };
};
