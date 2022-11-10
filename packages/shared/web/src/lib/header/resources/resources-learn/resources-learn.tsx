import { useTheme } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
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
      description: <FormattedMessage defaultMessage={'Learn how Notional works'} />,
      to: 'https://docs.notional.finance/notional-v2/',
    },
    {
      title: <FormattedMessage defaultMessage={'Developer Documentation'} />,
      icon: <DeveloperDocsIcon sx={{ color: theme.palette.background.accentDefault }} />,
      description: <FormattedMessage defaultMessage={'Review technical specifications'} />,
      to: 'https://docs.notional.finance/developer-documentation/',
    },
    {
      title: <FormattedMessage defaultMessage={'Video Tutorials'} />,
      icon: <YouTubeIcon sx={{ color: theme.palette.background.accentDefault }} />,
      description: <FormattedMessage defaultMessage={'Watch overview videos'} />,
      to: 'https://www.youtube.com/playlist?list=PLnKdM8f8QEJ2lJ59ZjhVCcJvrT056X0Ga',
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

export default ResourcesLearn;
