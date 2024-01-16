import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { Button, Faq, FaqHeader } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useContestRulesInfo } from '../../hooks';
import { BETA_ACCESS } from '@notional-finance/notionable';
import { useNotionalContext } from '@notional-finance/notionable-hooks';

export const ContestRulesInfo = () => {
  const theme = useTheme();
  const { dataSetOne, faqData } = useContestRulesInfo();
  const {
    globalState: { hasContestNFT },
  } = useNotionalContext();

  return (
    <>
      <Container>
        <TitleText>
          <FormattedMessage defaultMessage={'Contest rules'} />
        </TitleText>
        <Text>
          <FormattedMessage
            defaultMessage={`The prize category you compete in depends on the actions you’ve taken in your account. If you’ve used leverage you will compete for the high roller prize. If you have not used leverage, you will compete for the fat cat prize.`}
          />
        </Text>
        <Text>
          <FormattedMessage
            defaultMessage={`Actions you take during the contest can cause you to switch categories. If you have not used leverage and then do use leverage, you will switch from the fat cat category to the high roller category.`}
          />
        </Text>
        {dataSetOne.map(({ text }, index) => (
          <Box sx={{ display: 'flex' }} key={index}>
            <span>● </span>
            <LineItem>{text}</LineItem>
          </Box>
        ))}
      </Container>
      <Container>
        <FaqHeader
          sx={{ h2: { fontWeight: 600 } }}
          title={<FormattedMessage defaultMessage={'FAQ'} />}
        />
        {faqData.map(({ question, answer, componentAnswer }, index) => (
          <Faq
            key={index}
            question={question}
            answer={answer}
            componentAnswer={componentAnswer}
            sx={{
              marginBottom: theme.spacing(2),
              boxShadow: theme.shape.shadowStandard,
              h4: {
                fontSize: '16px',
                fontWeight: 600,
              },
              '#faq-body': {
                fontSize: '14px',
                fontWeight: 500,
              },
            }}
          />
        ))}
        <ButtonContainer>
          {hasContestNFT !== BETA_ACCESS.CONFIRMED && (
            <>
              <Button
                size="large"
                variant="outlined"
                to="/contest-leaderboard"
                sx={{
                  width: '358px',
                  border: `1px solid ${colors.neonTurquoise}`,
                  cursor: 'pointer',
                  ':hover': {
                    background: colors.matteGreen,
                  },
                  fontFamily: 'Avenir Next',
                }}
              >
                <FormattedMessage defaultMessage={'View Full Leaderboard'} />
              </Button>
              <Button
                size="large"
                sx={{
                  width: '300px',
                  fontFamily: 'Avenir Next',
                }}
                to="/contest"
              >
                <FormattedMessage defaultMessage={'Contest Home'} />
              </Button>
            </>
          )}
        </ButtonContainer>
      </Container>
    </>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      margin: auto;
      margin-top: ${theme.spacing(11)};
      max-width: 850px;      
      ${theme.breakpoints.down('md')} {
        max-width: 90%;
        margin: auto;
        margin-top: ${theme.spacing(11)};
      }
  `
);

const TitleText = styled(Box)(
  ({ theme }) => `
  color: ${colors.white};
  text-align: left;
  font-family: Avenir Next;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: 10px;
  text-transform: uppercase;
  margin-bottom: ${theme.spacing(4)};
  ${theme.breakpoints.down('md')} {
    text-align: center;
    text-wrap: nowrap;
    letter-spacing: 5px;
  }

      `
);
const ButtonContainer = styled(Box)(
  ({ theme }) => `
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin: ${theme.spacing(10, 0)};
  ${theme.breakpoints.down('md')} {
    flex-direction: column;
    gap: ${theme.spacing(5)};
  }
  ${theme.breakpoints.down('sm')} {
    a, button {
      width: 100%;
    }
    a {
      width: 100% !important;
    }
  }

      `
);

const Text = styled(Box)(
  ({ theme }) => `
  font-family: Avenir Next;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: ${colors.greenGrey};
  margin-bottom: ${theme.spacing(3)};
  `
);

const LineItem = styled('li')(
  ({ theme }) => `
  font-family: Avenir Next;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: ${colors.greenGrey};
  margin-bottom: ${theme.spacing(3)};
  margin-left: ${theme.spacing(1)};
  `
);

export default ContestRulesInfo;
