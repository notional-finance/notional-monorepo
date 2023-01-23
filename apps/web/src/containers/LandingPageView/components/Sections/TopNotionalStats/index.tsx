import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { styled, Box, useTheme } from '@mui/material';
import { useInView } from 'react-intersection-observer';
import { formatNumber } from '@notional-finance/helpers';
import iconUserDocsSvg from '@notional-finance/assets/icons/icon-user-docs.svg';
import iconAnalyticsDashboard from '@notional-finance/assets/icons/icon-analytics-dashboard.svg';
import iconDiscordSvg from '@notional-finance/assets/icons/icon-discord.svg';
import { H1, H3, H4 } from '@notional-finance/mui';

const TopNotionalStats = () => {
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });
  const theme = useTheme();
  const inViewClassName = inView ? 'fade-in' : 'hidden';
  const [topStats, setTopStats] = useState<{
    totalValueLocked: string;
    totalLoanVolume: string;
    totalAccounts: string;
  } | null>();

  const fetchKPIs = useCallback(async () => {
    try {
      const response = await fetch(
        'https://data-dev.notional.finance/kpis?network=mainnet',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
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
    <Box ref={ref} sx={{}}>
      <Box className={`section ${inViewClassName}`}>
        <Box>
          <Box
            hidden={topStats === null}
            sx={{
              background: theme.gradient.landing,
              padding: { xs: '30px 0', lg: '0 40px' },
              ul: {
                display: { xs: 'block', lg: 'flex' },
                justifyContent: 'space-around',
                color: theme.palette.common.white,
                li: {
                  padding: { xs: '20px 0', lg: '70px' },
                  textAlign: 'center',
                  width: '100%',
                },
              },
            }}
          >
            <ul>
              <li>
                <H1 contrast>{topStats?.totalValueLocked}</H1>
                <H3 contrast fontWeight="light">
                  <FormattedMessage
                    defaultMessage="Total Value Locked"
                    description={'landing page heading'}
                  />
                </H3>
              </li>
              <li>
                <H1 contrast>{topStats?.totalLoanVolume}</H1>
                <H3 contrast fontWeight="light">
                  <FormattedMessage
                    defaultMessage="Total Loan Volume"
                    description={'landing page heading'}
                  />
                </H3>
              </li>
              <li>
                <H1 contrast>{topStats?.totalAccounts}</H1>
                <H3 contrast fontWeight="light">
                  <FormattedMessage
                    defaultMessage="Total Accounts"
                    description={'landing page heading'}
                  />
                </H3>
              </li>
            </ul>
          </Box>
          <Box
            id="section-2-bottom-section"
            sx={{
              background: theme.palette.primary.accent,
              padding: { xs: 0, lg: '0 34px' },
              ul: {
                display: { xs: 'block', lg: 'flex' },
                justifyContent: 'space-around',
                color: theme.palette.common.white,
                padding: { xs: 0, lg: '80px 0' },
                li: {
                  display: 'flex',
                  padding: { xs: '40px 0px', lg: '30px' },
                  marginBottom: { xs: '10px', lg: 0 },
                  textAlign: 'center',
                  background:
                    'linear-gradient(267.16deg, #004453 19.48%, #002B36 105.58%)',
                  borderRadius: '4px',
                  width: { xs: '100%', lg: '360px' },
                  letterSpacing: '2px',
                  '&:last-child': {
                    marginBottom: { xs: '0px' },
                  },
                  '&:hover': {
                    boxShadow: '0px 4px 50px -10px #33F8FF',
                    transition: 'box-shadow 0.25s',
                  },
                  img: {
                    marginRight: '25px',
                    zIndex: 1,
                    marginLeft: { xs: '45px', lg: 0 },
                  },
                },
              },
            }}
          >
            <ul>
              <li>
                <img src={iconUserDocsSvg} alt="User documentation icon" />
                <StyledLink
                  contrast
                  href="https://docs.notional.finance/notional-v2/"
                >
                  <FormattedMessage
                    defaultMessage="User Documentation"
                    description="landing page link"
                  />
                  <i />
                </StyledLink>
              </li>
              <li>
                <img
                  src={iconAnalyticsDashboard}
                  alt="Analytics dashboard icon"
                />
                <StyledLink contrast href="https://info.notional.finance">
                  <FormattedMessage
                    defaultMessage="Notional Analytics"
                    description="landing page link"
                  />
                  <i />
                </StyledLink>
              </li>
              <li>
                <img src={iconDiscordSvg} alt="Discord channel icon" />
                <StyledLink contrast href="https://discord.notional.finance">
                  <FormattedMessage
                    defaultMessage="Join Us on Discord"
                    description="landing page link"
                  />
                  <i />
                </StyledLink>
              </li>
            </ul>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const StyledLink = styled(H4)(({ theme }) => ({
  background: `url('/assets/icons/icon-arrow-right-white-large.svg') no-repeat right 7px`,
  paddingRight: theme.spacing(3),
  position: 'relative',
  top: theme.spacing(1),
  i: {
    background: theme.gradient.landing,
    display: 'block',
    height: '2px',
    marginTop: theme.spacing(1),
  },
}));

export default TopNotionalStats;
