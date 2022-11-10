import { useTheme } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { ForumIcon } from '@notional-finance/icons';
import { SectionLinkProps, Section } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export function ResourcesGovernance() {
  const theme = useTheme();
  const heading = <FormattedMessage defaultMessage={'Governance'} />;
  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Protocol Parameters'} />,
      icon: <TuneIcon sx={{ color: theme.palette.background.accentDefault }} />,
      description: <FormattedMessage defaultMessage={'Understand selected parameters'} />,
      to: 'https://docs.notional.finance/governance',
    },
    {
      title: <FormattedMessage defaultMessage={'Governance Forum'} />,
      icon: <ForumIcon sx={{ color: theme.palette.background.accentDefault }} />,
      description: <FormattedMessage defaultMessage={'Discuss protocol changes'} />,
      to: 'https://forum.notional.finance/',
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

export default ResourcesGovernance;
