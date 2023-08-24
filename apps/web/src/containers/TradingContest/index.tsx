import { styled, Box, ThemeProvider } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { FeatureLoader } from '@notional-finance/shared-web';
import { ContestHeader, ContestTable } from './components';
import { useNotionalTheme } from '@notional-finance/styles';
// import bgColors from './bg-colors.svg';
import test from './Color_blobs.png';

export const TradingContest = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ marginTop: '-73px', background: '#041D2E', height: '100vh' }}>
        <FeatureLoader backgroundColor={'#041D2E'}>
          <Box
            sx={{ background: '#041D2E', height: '100vh', overflow: 'hidden' }}
          >
            <BgImgContainer>
              <img src={test} alt="bg img" />
            </BgImgContainer>

            <ContestHeader />
            <ContestTable />
          </Box>
        </FeatureLoader>
      </Box>
    </ThemeProvider>
  );
};

const BgImgContainer = styled(Box)(
  `
  overflow: hidden;
  position: absolute;
  width: 100vw;
  margin-top: 30%;
  img {
    width: 100%;
  }
    `
);

export default TradingContest;
