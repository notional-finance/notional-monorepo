import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { Faq, FaqHeader } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useContestRulesInfo } from '../../hooks';
import { ContestButtonBar } from '../contest-button-bar/contest-button-bar';
import { SectionTitle } from '../contest-shared-elements/contest-shared-elements';
import { useSelectedNetwork } from '@notional-finance/wallet';

export const ContestRulesInfo = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const { dataSetOne, faqData } = useContestRulesInfo();

  return (
    <>
      <Container>
        <SectionTitle>
          <FormattedMessage defaultMessage={'Contest rules'} />
        </SectionTitle>
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
        {/* TODO: Show only this button this if the user has minted a contest pass */}
        {/* <Button
          size="large"
          sx={{
            width: '300px',
            fontFamily: 'Avenir Next',
          }}
          to="/contest"
        >
          <FormattedMessage defaultMessage={'Contest Home'} />
        </Button> */}

        {/* TODO: Hide this if the user has minted a contest pass */}
        <Box sx={{ display: 'flex', marginTop: '100px' }}>
          <ContestButtonBar
            buttonOneText={
              <FormattedMessage defaultMessage={'View Full Leaderboard'} />
            }
            buttonOnePathTo={`/contest-leaderboard${network}`}
            buttonTwoText={<FormattedMessage defaultMessage={'Contest Home'} />}
            buttonTwoPathTo="/contest"
          />
        </Box>
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
        margin: auto;
        margin-top: ${theme.spacing(11)};
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
