import { useTheme } from '@mui/material';
import { Section, SectionLinkProps } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { BarChartIcon } from '@notional-finance/icons';
import { useInvestEarnYields } from '../use-invest-earn-yields';

export function LowRisk() {
  const theme = useTheme();
  const { highestLendRate } = useInvestEarnYields();

  const heading = <FormattedMessage defaultMessage={'Low Risk'} />;
  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      to: '/lend-fixed',
      icon: (
        <BarChartIcon
          sx={{
            fontSize: '1.5rem',
            fill: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage="Earn up to {rate} APY"
          values={{
            rate: highestLendRate,
          }}
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
