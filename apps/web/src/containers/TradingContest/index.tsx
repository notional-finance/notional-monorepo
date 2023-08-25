import { Box, ThemeProvider } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
// import { FeatureLoader } from '@notional-finance/shared-web';
import { ContestHeader, ContestHero, ContestCountDown } from './components';
import { CONTEST_TABLE_VARIANTS, ContestTable } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { useCompactTables } from './hooks';
// import bgColors from './bg-colors.svg';
// import test from './assets/color-blobs.png';

export const TradingContest = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const { tableColumns, tableDataOne, tableDataTwo, tableDataThree } =
    useCompactTables();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ marginTop: '-73px', background: '#041D2E', height: '100%' }}>
        {/* <FeatureLoader backgroundColor={'#041D2E'}> */}
        <Box
          sx={{
            background: '#041D2E',
            height: '100%',
            overflow: 'hidden',
            maxWidth: theme.spacing(150),
            margin: 'auto',
          }}
        >
          {/* <BgImgContainer>
            <img src={test} alt="bg img" />
          </BgImgContainer> */}
          <ContestHeader />
          <ContestHero />
          <ContestCountDown />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <ContestTable
              data={tableDataOne}
              columns={tableColumns}
              tableVariant={CONTEST_TABLE_VARIANTS.COMPACT}
            />
            <ContestTable
              data={tableDataTwo}
              columns={tableColumns}
              tableVariant={CONTEST_TABLE_VARIANTS.COMPACT}
            />
            <ContestTable
              data={tableDataThree}
              columns={tableColumns}
              tableVariant={CONTEST_TABLE_VARIANTS.COMPACT}
            />
          </Box>
        </Box>
        {/* </FeatureLoader> */}
      </Box>
    </ThemeProvider>
  );
};

// const BgImgContainer = styled(Box)(
//   `
//   overflow: hidden;
//   position: absolute;
//   width: 100vw;
//   margin-top: 30%;
//   img {
//     width: 100%;
//   }
//     `
// );

export default TradingContest;
