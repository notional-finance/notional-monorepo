import { FormattedMessage } from 'react-intl';
import { styled, Box, useTheme } from '@mui/material';
import { useInView } from 'react-intersection-observer';
import iconUserDocsSvg from '@notional-finance/assets/icons/icon-user-docs.svg';
import iconAnalyticsDashboard from '@notional-finance/assets/icons/icon-analytics-dashboard.svg';
import iconDiscordSvg from '@notional-finance/assets/icons/icon-discord.svg';
import { H4 } from '@notional-finance/mui';

export const TopNotionalStats = () => {
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });
  const theme = useTheme();
  const inViewClassName = inView ? 'fade-in' : 'hidden';

  return (
    <Box ref={ref} sx={{}}>
      <Box className={`section ${inViewClassName}`}>
        <Box>
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
