import { useTheme } from '@mui/material';
import { Section, SectionLinkProps } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { BlocksIcon, DashboardIcon, NotionalPlainIcon } from '@notional-finance/icons';

export function AboutCompany() {
  const theme = useTheme();
  const heading = <FormattedMessage defaultMessage={'Company'} />;
  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'About Notional'} />,
      to: '/about',
      icon: <NotionalPlainIcon sx={{ color: theme.palette.background.accentDefault }} />,
      description: <FormattedMessage defaultMessage={'Our mission, team & values'} />,
      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'Notional Foundation'} />,
      to: 'https://blog.notional.finance/notional-grant-program-rollout/',
      icon: <BlocksIcon sx={{ color: theme.palette.background.accentDefault }} />,
      description: <FormattedMessage defaultMessage={'Apply for a grant'} />,
    },
    {
      title: <FormattedMessage defaultMessage={'Dashboard'} />,
      to: 'https://info.notional.finance',
      icon: <DashboardIcon sx={{ color: theme.palette.background.accentDefault }} />,
      description: <FormattedMessage defaultMessage={'Follow Notional stats'} />,
    },
  ];

  return (
    <Section
      heading={heading}
      links={links}
      sx={{
        paddingTop: '48px',
        '.section-link-paper, .MuiPaper-root': {
          '&:hover': {
            transition: '.3s',
            transform: 'scale(1.1)',
            zIndex: 9,
            background: theme.palette.background.default,
          },
        },
      }}
    />
  );
}

export default AboutCompany;
