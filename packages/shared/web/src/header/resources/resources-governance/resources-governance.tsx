import { useTheme } from '@mui/material';
import {
  ResourcesIcon,
  BugBountyIcon,
  ForumIcon,
  NotionalPlainIcon,
} from '@notional-finance/icons';
import { SectionLinkProps, Section } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export function ResourcesGovernance() {
  const theme = useTheme();
  const heading = <FormattedMessage defaultMessage={'Governance'} />;
  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Governance Forum'} />,
      icon: (
        <ForumIcon sx={{ color: theme.palette.background.accentDefault }} />
      ),
      description: (
        <FormattedMessage defaultMessage={'Discuss protocol changes'} />
      ),
      to: 'https://forum.notional.finance/',
    },
    {
      title: <FormattedMessage defaultMessage={'Security'} />,
      to: 'https://github.com/notional-finance/contracts-v2/tree/master/audits',
      icon: (
        <ResourcesIcon
          sx={{
            color: theme.palette.background.accentDefault,
            fontSize: theme.spacing(3),
          }}
        />
      ),
      description: (
        <FormattedMessage defaultMessage={'Review Notional audits'} />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Bug Bounty'} />,
      to: 'https://immunefi.com/bounty/notional/',
      icon: (
        <BugBountyIcon
          sx={{
            color: theme.palette.background.accentDefault,
            fontSize: theme.spacing(3),
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={'Claim up to $500K for critical issues'}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'About Notional'} />,
      to: '/about',
      icon: (
        <NotionalPlainIcon
          sx={{
            color: theme.palette.background.accentDefault,
            fontSize: theme.spacing(3),
          }}
        />
      ),
      description: (
        <FormattedMessage defaultMessage={'Our mission, team and values'} />
      ),
      hideBorder: true,
      external: false,
    },
  ];
  return (
    <Section
      heading={heading}
      links={links}
      sx={{
        paddingTop: theme.spacing(6),
        background: theme.palette.background.paper,
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

export default ResourcesGovernance;
