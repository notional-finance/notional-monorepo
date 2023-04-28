import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { H5, H2, Body } from '@notional-finance/mui';
import { DashboardCarousel } from './components';

export const StatsAndTransparency = () => {
  const theme = useTheme();

  return (
    <BackgroundContainer>
      <InnerContainer>
        <Test>
          <H5 sx={{ color: colors.purpleGrey, marginBottom: theme.spacing(2) }}>
            <FormattedMessage defaultMessage={'Stats & Transparency'} />
          </H5>
          <H2 sx={{ color: colors.white, marginBottom: theme.spacing(3) }}>
            <FormattedMessage defaultMessage={'Don’t Trust, Verify'} />
          </H2>
          <BodyText>
            <FormattedMessage
              defaultMessage={`Notional is fully public, open source, and on-chain. Anyone can audit
        Notional’s code and balances to ensure funds are secure.`}
            />
          </BodyText>
        </Test>
        <DashboardCarousel />
      </InnerContainer>
    </BackgroundContainer>
  );
};

export default StatsAndTransparency;

const BackgroundContainer = styled(Box)(
  `
  height: 100%;
  width: 100%; 
    background: linear-gradient(271.53deg, rgba(191, 201, 245, 0.5) -60.81%, rgba(142, 161, 245, 0.5) -60.79%, #26CBCF 105.36%);
      `
);

const InnerContainer = styled(Box)(
  ({ theme }) => `
  height: ${theme.spacing(119)};
  margin: auto; 
  padding-top: ${theme.spacing(15)};
  
      `
);

const BodyText = styled(Body)(
  ({ theme }) => `
  color: ${colors.white}; 
  width: ${theme.spacing(65)};
  ${theme.breakpoints.down('mdLanding')} {
    width: 65%; 
  }
  ${theme.breakpoints.down('sm')} {
    width: 100%;
  }
    `
);

const Test = styled(Box)(
  ({ theme }) => `
  width: ${theme.spacing(150)};
  margin: auto;
  ${theme.breakpoints.down('mdLanding')} {
    width: ${theme.spacing(125)}; 
    padding-bottom: ${theme.spacing(4)};
  }
  ${theme.breakpoints.down('smLanding')} {
    width: 90%;
  }
    `
);
