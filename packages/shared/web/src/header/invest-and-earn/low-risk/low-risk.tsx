import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { Section } from '@notional-finance/mui';
import { useInvestEarnLinks } from '../use-invest-earn-links';

export function LowRisk() {
  const theme = useTheme();
  const { lowRiskLinks } = useInvestEarnLinks();
  const heading = <FormattedMessage defaultMessage={'LOW RISK'} />;

  return (
    <Section
      heading={heading}
      links={lowRiskLinks}
      sx={{
        padding: '64px',
        paddingTop: '48px',
        whiteSpace: 'nowrap',
        background: theme.palette.background.paper,
        '.section-link-container': {
          marginRight: '0px',
          zIndex: 0,
          orderColor: '',
        },
        '.text-container': {
          marginRight: '10px',
        },
        '.section-link-paper, .MuiPaper-root': {
          '&:hover': {
            transition: '.3s',
            background: theme.palette.background.default,
            transform: 'scale(1.1)',
            zIndex: 9,
            boxShadow:
              '-2px 1px 24px rgba(135, 155, 215, 0.2), 0px 4px 16px rgba(121, 209, 213, 0.4)',
          },
        },
      }}
    />
  );
}

export default LowRisk;
