import { useTheme } from '@mui/material';
import { Section } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useInvestEarnLinks } from '../use-invest-earn-links';

export function HighYield() {
  const theme = useTheme();
  const { highYieldLinks } = useInvestEarnLinks();
  const heading = <FormattedMessage defaultMessage={'High Yield'} />;

  return (
    <Section
      heading={heading}
      links={highYieldLinks}
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
