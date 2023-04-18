import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { H5, H2, Body } from '@notional-finance/mui';
import dashboard from './images/dashboard.svg';

export const StatsAndTransparency = () => {
  const theme = useTheme();

  return (
    <BackgroundContainer>
      <InnerContainer>
        <Box sx={{ width: '1200px', margin: 'auto' }}>
          <H5 sx={{ color: colors.purpleGrey, marginBottom: theme.spacing(2) }}>
            <FormattedMessage defaultMessage={'Stats & Transparency'} />
          </H5>
          <H2 sx={{ color: colors.white, marginBottom: theme.spacing(3) }}>
            <FormattedMessage defaultMessage={'Don’t Trust, Verify'} />
          </H2>
          <Body sx={{ color: colors.white, width: '520px' }}>
            <FormattedMessage
              defaultMessage={`Notional is fully public, open source, and on-chain. Anyone can audit
        Notional’s code and balances to ensure funds are secure.`}
            />
          </Body>
        </Box>

        <Wrapper>
          <Box sx={{ marginTop: '-82px', marginRight: '-100px' }}>
            <img src={dashboard} alt="dashboard" style={{ height: '600px' }} />
          </Box>
        </Wrapper>
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
  `
  height: 1100px;
  margin: auto; 
  padding-top: 120px;
  
      `
);

const Wrapper = styled(Box)(
  `
    display: flex;
    justify-content: end;
      `
);
