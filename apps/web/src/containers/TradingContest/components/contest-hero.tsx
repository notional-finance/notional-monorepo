import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { CONTEST_SIGN_UP_STEPS } from '@notional-finance/util';
import { ContestCountDown } from './contest-countdown';
import { BodySecondary, Button } from '@notional-finance/mui';
import { TitleText } from './contest-shared-elements';
import { messages } from '../contest-data';
import {
  contestActive,
  contestOver,
  useContestPass,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';

export const ContestHero = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const { hasContestPass } = useContestPass();

  return (
    <Box>
      <ContentContainer>
        <TextAndButtonWrapper>
          <>
            <TitleText>
              {hasContestPass && !contestActive ? (
                <FormattedMessage defaultMessage={'You are Entered!'} />
              ) : (
                <FormattedMessage defaultMessage={'Notional V3 STIP Blitz'} />
              )}
            </TitleText>
            <BodyText>
              {contestOver ? (
                <FormattedMessage {...messages.ContestOverHero.bodyText} />
              ) : (
                <FormattedMessage {...messages.ContestHero.bodyText} />
              )}
            </BodyText>
            <ContestCountDown
              title={contestActive ? 'Contest Ends:' : 'Contest Begins:'}
            />
            <ButtonContainer>
              <Button
                size="large"
                sx={{
                  marginBottom: theme.spacing(3),
                  width: '330px',
                  fontFamily: 'Avenir Next',
                  cursor: 'pointer',
                }}
                to={`/contest-leaderboard/${network}`}
              >
                {contestOver ? (
                  <FormattedMessage defaultMessage={'See Contest Results'} />
                ) : (
                  <FormattedMessage defaultMessage={'View Leaderboard'} />
                )}
              </Button>
              {/* {hasContestPass ? (
                <Button
                  size="large"
                  sx={{
                    marginBottom: theme.spacing(3),
                    width: '330px',
                    fontFamily: 'Avenir Next',
                    cursor: 'pointer',
                  }}
                  to={`/contest-leaderboard/${network}`}
                >
                  {contestOver ? (
                    <FormattedMessage defaultMessage={'See Contest Results'} />
                  ) : (
                    <FormattedMessage defaultMessage={'View Leaderboard'} />
                  )}
                </Button>
              ) : (
                <Button
                  size="large"
                  sx={{
                    marginBottom: theme.spacing(3),
                    width: '330px',
                    fontFamily: 'Avenir Next',
                    cursor: 'pointer',
                  }}
                  to={`/contest-sign-up/${network}/${CONTEST_SIGN_UP_STEPS.CONNECT_WALLET}`}
                >
                  {
                    <FormattedMessage
                      defaultMessage={'Join the Yield Contest'}
                    />
                  }
                </Button>
              )} */}
              {contestActive ? (
                <Button
                  size="large"
                  variant="outlined"
                  to={`/portfolio/${network}`}
                  sx={{
                    width: theme.spacing(41.25),
                    border: `1px solid ${colors.neonTurquoise}`,
                    ':hover': {
                      background: colors.matteGreen,
                    },
                    fontFamily: 'Avenir Next',
                  }}
                >
                  <FormattedMessage
                    defaultMessage={'See Yield Opportunities'}
                  />
                </Button>
              ) : (
                <Button
                  size="large"
                  variant="outlined"
                  to={`/contest-rules`}
                  sx={{
                    width: '330px',
                    border: `1px solid ${colors.neonTurquoise}`,
                    cursor: 'pointer',
                    ':hover': {
                      background: colors.matteGreen,
                    },
                    fontFamily: 'Avenir Next',
                  }}
                >
                  <FormattedMessage
                    defaultMessage={'Contest Rules And Prizes'}
                  />
                </Button>
              )}
            </ButtonContainer>
          </>
        </TextAndButtonWrapper>
      </ContentContainer>
    </Box>
  );
};

const ContentContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-around;
    ${theme.breakpoints.down('md')} {
      display: block;
      margin-top: ${theme.spacing(8)};
    }
      `
);

const TextAndButtonWrapper = styled(Box)(
  ({ theme }) => `
  width: 650px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: auto;
  ${theme.breakpoints.down('sm')} {
    width: 90%;
  }
  `
);

const ButtonContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  ${theme.breakpoints.down('md')} {
    align-items: center;
  }
  `
);

const BodyText = styled(BodySecondary)(
  ({ theme }) => `
    color: ${colors.greenGrey};
    font-weight: 400;
    margin-top: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(6)};
    ${theme.breakpoints.down('md')} {
      align-items: center;
    }
  `
);

export default ContestHero;
