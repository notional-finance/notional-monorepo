import { SectionLinkProps, ProgressIndicator } from '@notional-finance/mui';
import { useTheme } from '@mui/material';
import {
  PieChartIcon,
  BarChartIcon,
  BarChartLateralIcon,
  StakeIcon,
  VaultIcon,
  PointsIcon,
} from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { useDefaultNetwork } from './use-default-network';

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

export const useLeverageEarnLinks = () => {
  const theme = useTheme();
  const selectedNetwork = useDefaultNetwork();

  const earnLinks: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Lending'} />,
      to: `/lend-variable/${selectedNetwork}`,
      icon: (
        <BarChartIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: theme.palette.common.black,
          }}
        />
      ),
      pillText: <FormattedMessage defaultMessage={'Passive Yield'} />,
      external: false,
    },
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
      pillText: <FormattedMessage defaultMessage={'Guaranteed Yield'} />,
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
      pillText: <FormattedMessage defaultMessage={'High Yield'} />,
      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'NOTE Staking'} />,
      to: '/stake/ETH',
      icon: (
        <StakeIcon
          sx={{
            fontSize: theme.spacing(3),
            stroke: theme.palette.common.black,
            fill: 'transparent',
          }}
        />
      ),
      pillText: <FormattedMessage defaultMessage={'Reinvestment Yield'} />,
      external: false,
    },
  ];

  const leverageLinks: SectionLinkProps[] = [
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
      pillText: <FormattedMessage defaultMessage={'NOTE Yield'} />,
      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Yield Farming'} />,
      to: `/leveraged-yield-farming/${selectedNetwork}`,
      icon: (
        <VaultIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: theme.palette.common.black,
          }}
        />
      ),
      pillText: <FormattedMessage defaultMessage={'Organic Yield'} />,
      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Points Farming'} />,
      to: `/leveraged-points-farming/${selectedNetwork}`,
      icon: (
        <PointsIcon
          fill={theme.palette.typography.main}
          sx={{ fontSize: theme.spacing(3) }}
        />
      ),
      pillText: <FormattedMessage defaultMessage={'Points Yield'} />,
      external: false,
    },
  ];

  return { earnLinks, leverageLinks };
};
