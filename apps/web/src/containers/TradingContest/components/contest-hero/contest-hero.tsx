import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { CONTEST_SIGN_UP_STEPS } from '@notional-finance/util';
import { ContestCountDown } from '../contest-countdown/contest-countdown';
import { BodySecondary, Button } from '@notional-finance/mui';
import { TitleText } from '../contest-shared-elements/contest-shared-elements';
import { useSelectedNetwork } from '@notional-finance/wallet';

export const ContestHero = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  return (
    <Box>
      <ContentContainer>
        <TextAndButtonWrapper>
          <>
            <TitleText>
              <FormattedMessage defaultMessage={'Notional V3 STIP Blitz'} />
            </TitleText>
            <BodyText>
              <FormattedMessage
                defaultMessage={
                  'Contest runs Feb. 1st to Mar. 1st. Open to everyone and free to join. Click below to enter and compete for 27k $NOTE in prizes!'
                }
              />
            </BodyText>
            <ContestCountDown title={'Contest Begins:'} />
            <ButtonContainer>
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
                {<FormattedMessage defaultMessage={'Join the Yield Contest'} />}
              </Button>

              <Button
                size="large"
                variant="outlined"
                to={`/portfolio${network}//overview`}
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
                <FormattedMessage defaultMessage={'Back To App'} />
              </Button>
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
