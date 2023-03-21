import { useTheme } from '@mui/material';
import {
  GitHub,
  Twitter,
  YouTube,
  DescriptionOutlined,
} from '@mui/icons-material';

import { Section, SectionLinkProps } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { DiscordPlainIcon } from '@notional-finance/icons';

export function ResourcesCommunity() {
  const theme = useTheme();
  const heading = <FormattedMessage defaultMessage={'Community'} />;
  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Blog'} />,
      icon: (
        <DescriptionOutlined
          sx={{
            color: theme.palette.background.accentDefault,
            fontSize: theme.spacing(3),
          }}
        />
      ),
      to: 'https://blog.notional.finance/',
    },
    {
      title: <FormattedMessage defaultMessage={'Discord'} />,
      icon: (
        <DiscordPlainIcon
          sx={{
            color: theme.palette.background.accentDefault,
            fontSize: theme.spacing(3),
          }}
        />
      ),
      to: 'https://discord.notional.finance/',
    },
    {
      title: <FormattedMessage defaultMessage={'Github'} />,
      icon: (
        <GitHub
          sx={{
            color: theme.palette.background.accentDefault,
            fontSize: theme.spacing(3),
          }}
        />
      ),
      to: 'https://github.com/notional-finance/contracts-v2',
    },
    {
      title: <FormattedMessage defaultMessage={'Twitter'} />,
      icon: (
        <Twitter
          sx={{
            color: theme.palette.background.accentDefault,
            fontSize: theme.spacing(3),
          }}
        />
      ),
      to: 'https://twitter.com/NotionalFinance',
    },
    {
      title: <FormattedMessage defaultMessage={'YouTube'} />,
      icon: (
        <YouTube
          sx={{
            color: theme.palette.background.accentDefault,
            fontSize: theme.spacing(3),
          }}
        />
      ),
      to: 'https://www.youtube.com/channel/UC3JxsK1mTxPxRZs6TtGDo5g',
      hideBorder: true,
    },
  ];
  return (
    <Section
      condensed
      heading={heading}
      links={links}
      sx={{
        paddingTop: theme.spacing(6),
        paddingRight: theme.spacing(10),
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

export default ResourcesCommunity;
