import { useCallback, useEffect, useState } from 'react';
import { styled, Box, useTheme, ThemeProvider } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import {
  Body,
  H1,
  LargeInputText,
  BodySecondary,
  Button,
  ProgressIndicator,
} from '@notional-finance/mui';
import { ExternalLinkIcon } from '@notional-finance/icons';
import backgroundImg from './background.svg';
import statsImg from './stats_overlay.svg';
import { useNotionalTheme } from '@notional-finance/styles';
import { formatNumber } from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';

const KPIUrl = process.env['NX_KPIS_URL'] || 'https://data.notional.finance';
export const Hero = () => {
  const themeLanding = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const theme = useTheme();
  const [topStats, setTopStats] = useState<{
    totalValueLocked: string;
    totalLoanVolume: string;
    totalAccounts: string;
  } | null>();

  const fetchKPIs = useCallback(async () => {
    try {
      const response = await fetch(`${KPIUrl}/kpis?network=mainnet`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      const oneMillion = 1_000_000;
      const totalAccounts = data.accounts.total.overall;
      const totalLoanVolume = data.volume.overall.total;
      const totalValueLocked = data.tvl.total;
      setTopStats({
        totalValueLocked: `$${formatNumber(totalValueLocked / oneMillion, 0)}M`,
        totalLoanVolume: `$${formatNumber(totalLoanVolume / oneMillion, 0)}M`,
        totalAccounts: formatNumber(totalAccounts, 0),
      });
    } catch (e) {
      console.error(e);
      // If this query fails then the top stats bar won't show
      setTopStats(null);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  return (
    <ThemeProvider theme={themeLanding}>
      <HeroContainer>
        <Box sx={{ maxWidth: theme.breakpoints.values.lg, margin: 'auto' }}>
          <HeroContent>
            <H1>
              <FormattedMessage defaultMessage={'Maximum Returns.'} />
            </H1>
            <H1>
              <FormattedMessage defaultMessage={'Minimum Risk.'} />
            </H1>
            <Body
              sx={{ marginTop: theme.spacing(3), maxWidth: theme.spacing(68) }}
            >
              <FormattedMessage
                defaultMessage={`Lend, borrow, and earn leveraged yield with DeFi’s only fixed and variable rate lending protocol.`}
              />
            </Body>
            <ButtonContainer>
              <Button
                size="large"
                to="/portfolio/overview"
                sx={{
                  marginRight: theme.spacing(6),
                }}
              >
                <FormattedMessage defaultMessage={'Launch App'} />
              </Button>
              <Button
                size="large"
                variant="outlined"
                href="https://docs.notional.finance/developer-documentation/"
              >
                <FormattedMessage defaultMessage={'View Docs'} />
              </Button>
            </ButtonContainer>
          </HeroContent>
        </Box>
        <StatsContainer>
          <StatsContent>
            {topStats ? (
              <div>
                <LargeInputText>
                  {topStats?.totalValueLocked}
                  <BodySecondary>
                    <FormattedMessage defaultMessage={'Total Value Locked'} />
                  </BodySecondary>
                </LargeInputText>
                <LargeInputText sx={{ marginTop: theme.spacing(9) }}>
                  {topStats?.totalLoanVolume}
                  <BodySecondary>
                    <FormattedMessage defaultMessage={'Total Loan Volume'} />
                  </BodySecondary>
                </LargeInputText>
                <LargeInputText sx={{ marginTop: theme.spacing(9) }}>
                  {topStats?.totalAccounts}
                  <BodySecondary>
                    <FormattedMessage defaultMessage={'Active Accounts'} />
                  </BodySecondary>
                </LargeInputText>
                <Button
                  size="large"
                  variant="outlined"
                  sx={{ marginTop: theme.spacing(9) }}
                  href="https://info.notional.finance/"
                >
                  <FormattedMessage defaultMessage={'Analytics Dashboard'} />
                  <ExternalLinkIcon
                    sx={{
                      marginLeft: theme.spacing(2),
                      height: '1rem',
                      marginTop: '-2px',
                    }}
                    fill={theme.palette.primary.main}
                  />
                </Button>
              </div>
            ) : (
              <ProgressIndicator type="circular" />
            )}
          </StatsContent>
        </StatsContainer>
      </HeroContainer>
    </ThemeProvider>
  );
};

const HeroContainer = styled(Box)(
  ({ theme }) => `
  background: url(${backgroundImg}) no-repeat;
  background-size: 100% 100%;
  height: 100vh;
  min-height: ${theme.spacing(100)};
  min-width: 100vw;
  background-color: ${theme.palette.background.paper};
  overflow: hidden;
  margin-top: -${theme.spacing(9)};
  ${theme.breakpoints.down('md')} {
    background-size: 100% 100%;
    min-height: ${theme.spacing(180)};
  }
  ${theme.breakpoints.down('sm')} {
    min-height: ${theme.spacing(180)};
  }
`
);

const HeroContent = styled(Box)(
  ({ theme }) => `
  z-index: 2;
  margin-top: ${theme.spacing(20)};
  ${theme.breakpoints.down('lg')} {
    margin-left: ${theme.spacing(15)};
  }
  ${theme.breakpoints.down('md')} {
    width: fit-content;
    margin: ${theme.spacing(20)} auto auto auto;
  }
  ${theme.breakpoints.down('sm')} {
    margin: ${theme.spacing(20)} ${theme.spacing(2)} auto ${theme.spacing(2)};
    h1 {
      font-size: 36px;
    }
    p {
      font-size: 18px;
    }
  }
`
);

const StatsContainer = styled(Box)(
  ({ theme }) => `
  background: url(${statsImg}) no-repeat;
  background-size: ${theme.spacing(50)} 100%;
  height: 100vh;
  min-height: ${theme.spacing(100)};
  width: ${theme.spacing(50)};
  right: 0;
  position: absolute;
  backdrop-filter: blur(2px);
  top: 0;
  border-image: linear-gradient(to top, ${
    theme.palette.primary.light
  }, rgba(0, 0, 0, 0)) 1 100%;
  border-width: 0 0 0 1px;
  border-style: solid;
  text-align: center;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  ${theme.breakpoints.down('md')} {
    background-size: 100% ${theme.spacing(81)};
    min-height: 0px;
    height: ${theme.spacing(81)};
    width: fit-content;
    margin: auto;
    position: relative;
    justify-content: center;
    border: 1px solid ${theme.palette.primary.light};
    border-radius: ${theme.shape.borderRadius()};
  }
`
);

const StatsContent = styled(Box)(
  ({ theme }) => `
  z-index: 2;
  display: flex;
  flex-direction: column;
  margin-top: ${theme.spacing(20)};
  ${theme.breakpoints.down('md')} {
    margin: 0 ${theme.spacing(2)} 0 ${theme.spacing(2)}};
    align-items: center;
    justify-content: center;
  }
  `
);

const ButtonContainer = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(9)};
  margin-bottom: ${theme.spacing(9)};
  ${theme.breakpoints.down('md')} {
    button {
      width: 100%;
      margin-bottom: ${theme.spacing(4)};
    }
  }
  `
);

export default Hero;
