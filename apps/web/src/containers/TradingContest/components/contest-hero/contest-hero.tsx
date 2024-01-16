import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { ContestButtonStack } from '../contest-button-stack/contest-button-stack';
import { ContestCountDown } from '../contest-countdown/contest-countdown';
import { BodySecondary } from '@notional-finance/mui';

export const ContestHero = () => {
  const theme = useTheme();
  return (
    <Container>
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
              buttonText={
                <FormattedMessage defaultMessage={'Join the Yield Contest'} />
              }
            />
          </>
        </TextAndButtonWrapper>
      </ContentContainer>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      margin-top: ${theme.spacing(5)};
      `
);

const ContentContainer = styled(Box)(
  ({ theme }) => `
    margin-top: ${theme.spacing(15)};
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
  margin-top: ${theme.spacing(5)}; 
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

const TitleText = styled(Box)(
  ({ theme }) => `
  color: ${colors.white};
  font-family: Avenir Next;
  font-size: 48px;
  font-style: normal;
  font-weight: 600;
  line-height: 67.2px;
  ${theme.breakpoints.down('md')} {
    font-size: 32px;
    margin: ${theme.spacing(0, 2)};
  }
      `
);

export default ContestHero;
