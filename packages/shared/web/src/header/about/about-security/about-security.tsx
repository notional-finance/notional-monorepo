import { useTheme } from '@mui/material';
import { Section, SectionLinkProps } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  BugBountyIcon,
  GovernanceIcon,
  InsuranceIcon,
  ResourcesIcon,
} from '@notional-finance/icons';

export function AboutSecurity() {
  const theme = useTheme();
  const heading = <FormattedMessage defaultMessage={'Security'} />;
  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Security'} />,
      to: 'https://github.com/notional-finance/contracts-v2/tree/master/audits',
      icon: (
        <ResourcesIcon sx={{ color: theme.palette.background.accentDefault, fontSize: '1.5rem' }} />
      ),
      description: <FormattedMessage defaultMessage={'Review Notional audits'} />,
    },
    {
      title: <FormattedMessage defaultMessage={'Insurance'} />,
      to: 'https://app.nexusmutual.io/cover/buy/get-quote?address=0x1344A36A1B56144C3Bc62E7757377D288fDE0369',
      icon: (
        <InsuranceIcon sx={{ color: theme.palette.background.accentDefault, fontSize: '1.5rem' }} />
      ),
      description: <FormattedMessage defaultMessage={'Get cover for your positions'} />,
    },
    {
      title: <FormattedMessage defaultMessage={'Bug Bounty'} />,
      to: 'https://immunefi.com/bounty/notional/',
      icon: (
        <BugBountyIcon sx={{ color: theme.palette.background.accentDefault, fontSize: '1.5rem' }} />
      ),
      description: <FormattedMessage defaultMessage={'Claim up to $1M for critical issues'} />,
    },
    {
      title: <FormattedMessage defaultMessage={'Protocol Parameters'} />,
      to: 'https://docs.notional.finance/governance',
      icon: (
        <GovernanceIcon
          sx={{ color: theme.palette.background.accentDefault, fontSize: '1.5rem' }}
        />
      ),
      description: <FormattedMessage defaultMessage={'Understand selected parameters'} />,
    },
  ];

  return (
    <Section
      heading={heading}
      links={links}
      sx={{
        paddingTop: '48px',
        background: theme.palette.background.default,
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

export default AboutSecurity;
