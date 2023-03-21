import { useTheme } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TuneIcon from '@mui/icons-material/Tune';
import { DeveloperDocsIcon, DocsIcon } from '@notional-finance/icons';
import { Section, SectionLinkProps } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export function ResourcesLearn() {
  const theme = useTheme();
  const heading = <FormattedMessage defaultMessage={'Learn'} />;
  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'User Documentation'} />,
      icon: (
        <DocsIcon
          sx={{
            color: theme.palette.background.accentDefault,
            fontSize: '30px',
            marginLeft: '-5px',
          }}
        />
      ),
      description: (
        <FormattedMessage defaultMessage={'Learn how Notional works'} />
      ),
      to: 'https://docs.notional.finance/notional-v2/',
    },
    {
      title: <FormattedMessage defaultMessage={'Developer Documentation'} />,
      icon: (
        <DeveloperDocsIcon
          sx={{ color: theme.palette.background.accentDefault }}
        />
      ),
      description: (
        <FormattedMessage defaultMessage={'Review technical specifications'} />
      ),
      to: 'https://docs.notional.finance/developer-documentation/',
    },
    {
      title: <FormattedMessage defaultMessage={'Video Tutorials'} />,
      icon: (
        <YouTubeIcon sx={{ color: theme.palette.background.accentDefault }} />
      ),
      description: (
        <FormattedMessage defaultMessage={'Watch overview videos'} />
      ),
      to: 'https://www.youtube.com/playlist?list=PLnKdM8f8QEJ2lJ59ZjhVCcJvrT056X0Ga',
    },
    {
      title: <FormattedMessage defaultMessage={'Protocol Parameters'} />,
      icon: <TuneIcon sx={{ color: theme.palette.background.accentDefault }} />,
      description: (
        <FormattedMessage defaultMessage={'Understand selected parameters'} />
      ),
      to: 'https://docs.notional.finance/governance',
      hideBorder: true,
    },
  ];
  return (
    <Section
      heading={heading}
      links={links}
      sx={{
        background: theme.palette.background.paper,
        paddingTop: theme.spacing(6),
        paddingLeft: theme.spacing(10),
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

export default ResourcesLearn;
