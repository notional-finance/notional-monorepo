import { useTheme } from '@mui/material';
import { Section, SectionLinkProps } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { StakeIcon, VaultIcon } from '@notional-finance/icons';
import { useInvestEarnYields } from '../use-invest-earn-yields';

export function HighYield() {
  const theme = useTheme();
  const heading = <FormattedMessage defaultMessage={'High Yield'} />;
  const { highestVaultApy } = useInvestEarnYields();

  const links: SectionLinkProps[] = [
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
          defaultMessage={'Leverage DeFi yields and earn'}
          values={{
            rate: highestVaultApy,
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

  return (
    <Section
      heading={heading}
      links={links}
      sx={{
        padding: '64px',
        paddingTop: '48px',
        whiteSpace: 'nowrap',
        background: theme.palette.background.default,
        '.section-link-container': {
          marginRight: '0px',
          zIndex: 0,
        },
        '.text-container': {
          marginRight: '10px',
        },
        '.section-link-paper, .MuiPaper-root': {
          '&:hover': {
            transition: '.3s',
            transform: 'scale(1.1)',
            zIndex: 9,
            background: theme.palette.background.default,
            boxShadow:
              '-2px 1px 24px rgba(135, 155, 215, 0.2), 0px 4px 16px rgba(121, 209, 213, 0.4)',
          },
        },
      }}
    />
  );
}

export default HighYield;
