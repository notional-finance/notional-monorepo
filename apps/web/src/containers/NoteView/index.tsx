import { alpha, Box, styled, ThemeProvider } from '@mui/material';
import { H1, Body } from '@notional-finance/mui';
import { colors, useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { NoteViewSubNav, ContentContainer } from './components';
import { NoteSummary } from './note-summary/note-summary';
import StakedNote from './staked-note/staked-note';
import NoteSupply from './note-supply/note-supply';
import NoteGovernance from './note-governance/note-governance';
import NoteDelegate from './note-delegate/note-delegate';

export const NoteView = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100%' }}>
        <GridBackground>
          {Array(44 * 44)
            .fill(null)
            .map((_, index) => (
              <GridCell key={index} />
            ))}
        </GridBackground>
        <MainContainer>
          <Content>
            <H1 sx={{ textAlign: 'center', paddingTop: theme.spacing(12) }}>
              <FormattedMessage defaultMessage={'The NOTE token'} />
            </H1>
            <Body
              sx={{
                textAlign: 'center',
                margin: 'auto',
                paddingTop: theme.spacing(3),
                maxWidth: theme.spacing(59),
              }}
            >
              <FormattedMessage
                defaultMessage={`Explore the NOTE token's critical role and utility within Notional`}
              />
            </Body>
          </Content>
          <BgContainer>
            <NoteViewSubNav />
            <ContentContainer>
              <NoteSummary />
              <StakedNote />
              <NoteSupply />
              <NoteGovernance />
              <NoteDelegate />
            </ContentContainer>
          </BgContainer>
        </MainContainer>
      </Box>
    </ThemeProvider>
  );
};

const GridBackground = styled('div')(
  `
  position: absolute;
  overflow: hidden;
  width: 100vw !important;
  height: 100vh !important;
  background-color: #041D2E;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
  grid-template-rows: repeat(auto-fit, minmax(44px, 1fr));
  grid-auto-flow: row;
  z-index: 1;
`
);

const GridCell = styled('div')(
  `
  overflow: hidden;
  background-color: inherit; 
  border: 0.5px solid ${alpha(colors.aqua, 0.15)};
  box-sizing: border-box;
`
);

// const HalfMoonBackground = styled('div')(({ theme }) => ({
//   position: 'relative',
//   width: '100%',
//   height: '100%',
//   backgroundColor: 'rgba(0, 0, 0, 0.3)',
//   background: `radial-gradient(circle at top left, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 70%)`,
// }));

// background: radial-gradient(circle at top center, #333, #333 50%, #eee 75%, #333 75%);

// background: radial-gradient(circle at top center, ${alpha(
//   colors.aqua,
//   0.8
// )} 0%, rgba(0, 0, 0, 0) 70%);

const Content = styled(Box)(
  `
    height: 400px;
    width: 100%;
    background: radial-gradient(ellipse at top center, ${alpha(
      colors.aqua,
      0.3
    )} 0%, 
    ${alpha('#041D2E', 0.9)}
    60%,  ${alpha('#041D2E', 0.9)} 85%);
    padding-bottom: 100px;
`
);

const BgContainer = styled(Box)(
  `
    height: 100%;
    width: 100%;
    background: #041D2E;
`
);

const MainContainer = styled(Box)(
  `
    background: transparent;
    height: 100%;
    overflow: hidden;
    position: relative;
    z-index: 3;
      `
);

export default NoteView;
