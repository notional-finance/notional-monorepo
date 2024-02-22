import { Box, ThemeProvider, styled } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  ContestCountDown,
  ContestPrizes,
  SectionTitle,
  OuterContainer,
  BgImgContainer,
  MainContainer,
  ContestButtonBar,
  ContestPartnersButtons,
} from '../components';
import { useContestPass } from '@notional-finance/notionable-hooks';
import { ContestTable, LinkText, Button } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { colors } from '@notional-finance/styles';
import test from '../assets/color-blobs.png';
import { useLeaderBoardTables } from '../hooks';
import { useSelectedNetwork } from '@notional-finance/wallet';
import { Caption } from '@notional-finance/mui';

export const ContestLeaderBoard = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const network = useSelectedNetwork();
  const { hasContestPass } = useContestPass();
  const {
    leaderBoardColumns,
    currentUserData,
    currentUserColumns,
    highRollerData,
    fatCatData,
    setHighRollerPartner,
    highRollerPartner,
    setFatCatPartner,
    fatCatPartner,
  } = useLeaderBoardTables();

  return (
    <ThemeProvider theme={theme}>
      <OuterContainer>
        <BgImgContainer>
          <img src={test} alt="bg img" />
        </BgImgContainer>
        <OpacityBG>
          <MainContainer>
            <SectionTitle
              sx={{
                marginBottom: theme.spacing(4),
                display: 'flex',
              }}
            >
              <Box
                component="span"
                sx={{
                  marginTop: theme.spacing(10),
                }}
              >
                <FormattedMessage defaultMessage={'Leaderboard'} />
              </Box>
            </SectionTitle>
            <CountDownContainer>
              <ContestCountDown sx={{ marginBottom: '0px' }} />
              <Button
                size="large"
                variant="outlined"
                to={`/contest-rules/${network}`}
                sx={{
                  width: theme.spacing(41.25),
                  border: `1px solid ${colors.neonTurquoise}`,
                  ':hover': {
                    background: colors.matteGreen,
                  },
                  fontFamily: 'Avenir Next',
                }}
              >
                <FormattedMessage defaultMessage={'Contest Rules & Prizes'} />
              </Button>
            </CountDownContainer>
            {currentUserData.length > 0 && (
              <Box>
                <SectionTitle
                  sx={{
                    marginBottom: theme.spacing(4),
                    marginTop: theme.spacing(13),
                    display: 'flex',
                  }}
                >
                  <FormattedMessage
                    defaultMessage={'Your {position} Position'}
                    values={{
                      position: (
                        <Box
                          sx={{
                            color: colors.neonTurquoise,
                            margin: theme.spacing(0, 1),
                          }}
                        >
                          {currentUserData[0].username?.dataSet === 'highRoller'
                            ? 'HIGH ROLLER'
                            : 'FAT CAT'}
                        </Box>
                      ),
                    }}
                  />
                </SectionTitle>
                <UserTableContainer>
                  <ContestTable
                    columns={currentUserColumns}
                    data={currentUserData}
                    isCurrentUser
                  />
                  {currentUserData[0].totalDeposits.value < 100 && (
                    <Caption
                      sx={{
                        color: colors.red,
                        fontWeight: 500,
                        marginTop: theme.spacing(1),
                      }}
                    >
                      <FormattedMessage
                        defaultMessage={
                          'Your total deposits must be greater than $100 to compete for a prize.'
                        }
                      />
                    </Caption>
                  )}
                  <LinkText
                    to="/portfolio/overview"
                    sx={{ marginTop: theme.spacing(1) }}
                  >
                    <FormattedMessage defaultMessage={'View in Portfolio'} />
                  </LinkText>
                </UserTableContainer>
              </Box>
            )}
            <TableContainer>
              <ContestPartnersButtons
                setPartnerCallback={setHighRollerPartner}
                partnerId={highRollerPartner}
              />
              <ContestTable
                maxHeight={theme.spacing(77.5)}
                tableTitle={<FormattedMessage defaultMessage={'HIGH ROLLER'} />}
                columns={leaderBoardColumns}
                data={highRollerData}
                tableLoading={
                  highRollerData.length === 0 && highRollerPartner === 0
                }
              />
            </TableContainer>
            <TableContainer>
              <ContestPartnersButtons
                setPartnerCallback={setFatCatPartner}
                partnerId={fatCatPartner}
              />
              <ContestTable
                maxHeight={theme.spacing(77.5)}
                tableTitle={<FormattedMessage defaultMessage={'FAT CAT'} />}
                columns={leaderBoardColumns}
                data={fatCatData}
                tableLoading={fatCatData.length === 0 && fatCatPartner === 0}
              />
            </TableContainer>
            <ContestPrizes />
            {!hasContestPass && (
              <Box sx={{ display: 'flex', marginTop: '100px' }}>
                <ContestButtonBar
                  buttonOneText={
                    <FormattedMessage defaultMessage={'Rules & Prizes'} />
                  }
                  buttonOnePathTo={`/contest-rules/${network}`}
                  buttonTwoText={
                    <FormattedMessage defaultMessage={'Contest Home'} />
                  }
                  buttonTwoPathTo={`/contest/${network}`}
                />
              </Box>
            )}
          </MainContainer>
        </OpacityBG>
      </OuterContainer>
    </ThemeProvider>
  );
};

const TableContainer = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(11)};
  ${theme.breakpoints.down('md')} {
    display: flex;
    justify-content: center;
    margin-top: ${theme.spacing(11)};
  }
    `
);

const UserTableContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: column;
  ${theme.breakpoints.down('md')} {
    justify-content: center;
    flex-direction: column;
  }
    `
);

const CountDownContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${theme.breakpoints.down('sm')} {
    display: flex;
    justify-content: center;
    flex-direction: column;
    a { margin-top: ${theme.spacing(4)}; }
  }
    `
);

const OpacityBG = styled(Box)(
  `
  background: rgba(4, 29, 46, 0.85);
  position: relative;
  z-index: 3;
    `
);

export default ContestLeaderBoard;
