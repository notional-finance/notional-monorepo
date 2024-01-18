import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { CONTEST_SIGN_UP_STEPS } from '@notional-finance/util';
import { ContestButtonStack } from '../contest-button-stack/contest-button-stack';
import { ContestCountDown } from '../contest-countdown/contest-countdown';
import { BodySecondary } from '@notional-finance/mui';
import { TitleText } from '../contest-shared-elements/contest-shared-elements';

export const ContestHero = () => {
  const theme = useTheme();
  return (
    <Box>
      <ContentContainer>
        <TextAndButtonWrapper>
          <>
            <TitleText>
              <FormattedMessage defaultMessage={'Notional V3 STIP Blitz'} />
            </TitleText>
            <BodySecondary
              sx={{
                color: colors.greenGrey,
                fontWeight: 400,
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(6),
              }}
            >
              <FormattedMessage
                defaultMessage={
                  'Contest runs Feb. 1st to Mar. 1st. Open to everyone and free to join. Click below to enter and compete for 27k $NOTE in prizes!'
                }
              />
            </BodySecondary>
            <ContestCountDown title={'Contest Begins:'} />
            <ContestButtonStack
              to={`/contest-sign-up/${CONTEST_SIGN_UP_STEPS.CONNECT_WALLET}`}
              buttonText={
                <FormattedMessage defaultMessage={'Join the Yield Contest'} />
              }
            />
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
  ${theme.breakpoints.down('md')} {
    width: 100%;
  }
  `
);

export default ContestHero;
