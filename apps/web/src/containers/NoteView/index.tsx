import { alpha, Box, styled, ThemeProvider } from '@mui/material';
import { H1, Body } from '@notional-finance/mui';
import { colors, useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { NoteViewSubNav, SquareGridBg } from './components';
import { NoteSummary } from './note-supply/note-summary';
import StakedNote from './staked-note/staked-note';
import NoteSupply from './note-supply/note-supply';
import NoteGovernance from './note-governance/note-governance';
import {
  useNoteSupplyData,
  useStakedNoteData,
} from '@notional-finance/notionable-hooks';
import NoteDelegate from './note-delegate/note-delegate';

export const NoteView = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const supplyData = useNoteSupplyData();
  const stakedNoteData = useStakedNoteData();

  return (
    <ThemeProvider theme={theme}>
      <SquareGridBg height={theme.spacing(62.5)} />
      <MainContainer>
        <TopGradientBg>
          <H1 sx={{ textAlign: 'center', paddingTop: theme.spacing(12) }}>
            <FormattedMessage defaultMessage={'The NOTE Token'} />
          </H1>
          <Body
            sx={{
              textAlign: 'center',
              margin: 'auto',
              width: '90%',
              paddingTop: theme.spacing(3),
              maxWidth: theme.spacing(59),
            }}
          >
            <FormattedMessage
              defaultMessage={`Explore the NOTE token's critical role and utility within Notional`}
            />
          </Body>
        </TopGradientBg>
        <DefaultBgContainer>
          <NoteViewSubNav />
          <NoteSummary noteSupplyData={supplyData} />
        </DefaultBgContainer>
        <Box>
          <SquareGridBg height={theme.spacing(91.25)} />
          <StakeNoteGradientBg>
            <StakedNote stakedNoteData={stakedNoteData} />
          </StakeNoteGradientBg>
        </Box>

        <DefaultBgContainer>
          <NoteSupply noteSupplyData={supplyData} />
        </DefaultBgContainer>
        <DefaultBgContainer>
          <GovernanceGradientBg>
            <NoteGovernance />
          </GovernanceGradientBg>
        </DefaultBgContainer>
        <Box>
          <SquareGridBg height={theme.spacing(100)} />
          <DelegateGradientBg>
            <NoteDelegate />
          </DelegateGradientBg>
        </Box>
      </MainContainer>
    </ThemeProvider>
  );
};

const TopGradientBg = styled(Box)(
  ({ theme }) => `
    height: ${theme.spacing(50)};
    width: 100%;
    background: radial-gradient(ellipse at top center, ${alpha(
      colors.aqua,
      0.3
    )} 0%, 
    ${alpha('#041D2E', 0.9)}
    60%,  ${alpha('#041D2E', 0.9)} 85%);
    padding-bottom: 100px;
    z-index: 4;
    ${theme.breakpoints.down('sm')} {
      height: 100%;
      padding-top: ${theme.spacing(12.5)};
      padding-bottom: ${theme.spacing(31.25)};
    }
`
);

const StakeNoteGradientBg = styled(Box)(
  `
    height: 100%;
    position: relative;
    width: 100%;
    background: radial-gradient(closest-side, ${alpha(
      colors.aqua,
      0.7
    )}, ${alpha(colors.aqua, 0.1)}, #041D2E);
    z-index: 4;
`
);

const GovernanceGradientBg = styled(Box)(
  ({ theme }) => `
    height: 100%;
    position: relative;
    width: 80%;
    margin: auto;
    background: radial-gradient(closest-side, ${alpha(
      colors.aqua,
      0.1
    )}, ${alpha(colors.aqua, 0.1)}, #041D2E);
    z-index: 4;
    ${theme.breakpoints.down('sm')} {
      width: 100%;
    }
`
);

const DelegateGradientBg = styled(Box)(
  `
    height: 100%;
    position: relative;
    width: 100%;
    background: linear-gradient(#041D2E, transparent);
    z-index: 4;
`
);

const DefaultBgContainer = styled(Box)(
  `
    height: 100%;
    width: 100%;
    position: relative;
    z-index: 3;
    background: #041D2E;
`
);

const MainContainer = styled(Box)(
  `
    height: 100%;
    overflow: hidden;
    position: relative;
    z-index: 3;
      `
);

export default NoteView;
