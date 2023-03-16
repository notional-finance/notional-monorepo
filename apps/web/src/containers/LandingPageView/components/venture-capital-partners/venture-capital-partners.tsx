import { FormattedMessage } from 'react-intl';
import { useInView } from 'react-intersection-observer';
import panteraSvg from '@notional-finance/assets/marketing/partners/pantera.svg';
import spartanSvg from '@notional-finance/assets/marketing/partners/spartan.svg';
import ideoCoLabSvg from '@notional-finance/assets/marketing/partners/ideo-colab.svg';
import oneCSvg from '@notional-finance/assets/marketing/partners/1c.svg';
import coinbaseVenturesSvg from '@notional-finance/assets/marketing/partners/coinbase-ventures.svg';
import parafiSvg from '@notional-finance/assets/marketing/partners/parafi.svg';
import nascentSvg from '@notional-finance/assets/marketing/partners/nascent.svg';
import { Box, styled, useTheme } from '@mui/material';
import { ExternalLink, H1 } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/shared-config';

export const VentureCapitalPartners = () => {
  const theme = useTheme();
  const lightTheme = useNotionalTheme(THEME_VARIANTS.LIGHT, 'landing');
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });
  const inViewClassName = inView ? 'fade-in' : 'hidden';

  return (
    <Box ref={ref}>
      <Box
        className={`section ${inViewClassName}`}
        sx={{
          background: lightTheme.palette.background.accentPaper,
          paddingTop: theme.spacing(16),
          paddingLeft: { xs: theme.spacing(4), lg: theme.spacing(20) },
          paddingRight: { xs: theme.spacing(4), lg: theme.spacing(20) },
          paddingBottom: theme.spacing(0),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: theme.spacing(16),
          }}
        >
          <H1 contrast sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
            <FormattedMessage
              defaultMessage={'Backed by the best in the industry'}
            />
          </H1>
          {/* this displays inline with the title on desktop*/}
          <Box
            sx={{
              display: { xs: 'none', lg: 'block' },
              marginRight: theme.spacing(4),
            }}
          >
            <ExternalLink href="https://panteracapital.com/">
              <img
                height="100px"
                width="320px"
                src={panteraSvg}
                alt="Pantera logo"
              />
            </ExternalLink>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* this displays in column with the title on mobile */}
          <Item sx={{ display: { xs: 'block', lg: 'none' } }}>
            <ExternalLink href="https://panteracapital.com/">
              <img
                height="100px"
                width="320px"
                src={panteraSvg}
                alt="Pantera logo"
              />
            </ExternalLink>
          </Item>
          <Item>
            <ExternalLink href="https://www.parafi.capital/">
              <img
                height="100px"
                width="320px"
                src={parafiSvg}
                alt="Parafi Logo"
              />
            </ExternalLink>
          </Item>
          <Item>
            <ExternalLink href="https://nascent.xyz/">
              <img
                height="100px"
                width="320px"
                src={nascentSvg}
                alt="Nascent Logo"
              />
            </ExternalLink>
          </Item>
          <Item>
            <ExternalLink href="https://www.1confirmation.com/">
              <img height="100px" src={oneCSvg} alt="1 Confirmation logo" />
            </ExternalLink>
          </Item>
          <Item>
            <ExternalLink href="https://ventures.coinbase.com/">
              <img
                height="100px"
                width="320px"
                src={coinbaseVenturesSvg}
                alt="Coinbase Ventures logo"
              />
            </ExternalLink>
          </Item>
          <Item>
            <ExternalLink href="https://www.spartangroup.io/">
              <img
                height="100px"
                width="320px"
                src={spartanSvg}
                alt="Spartan logo"
              />
            </ExternalLink>
          </Item>
          <Item>
            <ExternalLink href="https://www.ideocolab.com/">
              <img height="100px" src={ideoCoLabSvg} alt="IDEO Co-Lab" />
            </ExternalLink>
          </Item>
        </Box>
      </Box>
    </Box>
  );
};

const Item = styled(Box)(
  ({ theme }) => `
  width: 100%;
  text-align: center;
  margin-bottom: ${theme.spacing(16)};

  ${theme.breakpoints.up('lg')} {
    width: 33%;
  }
`
);

export default VentureCapitalPartners;
