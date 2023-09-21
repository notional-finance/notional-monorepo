import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useContestRulesInfo } from '../../hooks';
import { BETA_ACCESS } from '@notional-finance/notionable';
import { useNotionalContext } from '@notional-finance/notionable-hooks';

export const ContestRulesInfo = () => {
  const { dataSetOne, dataSetTwo } = useContestRulesInfo();
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
            defaultMessage={`The prize category you're competing in depends on the actions you've taken in your account. If you've used leverage, you're competing in the HIGH ROLLER category. 
                            If you haven't used leverage, you'll compete in the FAT CAT category. If you have lost money, you're competing to be the SAD SACK. 
                            Actions you take can cause you to switch which prize category you're in. For example, if you haven't used leverage but then choose to use leverage, you will be competing for the 
                            HIGH ROLLER instead of the FAT CAT from that point on.`}
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
        <TitleText>
          <FormattedMessage defaultMessage={'What is Realized APY?'} />
        </TitleText>
        <Text>
          <FormattedMessage
            defaultMessage={`Realized APY is calculated using the <a>IRR calculation.</a> The realized APY measures how much money you made relative to the money you started with and in what amount of time.`}
            values={{
              a: (chunk: React.ReactNode) => (
                <Box
                  sx={{ color: colors.neonTurquoise }}
                  href="https://www.investopedia.com/terms/i/irr.asp"
                  component={'a'}
                  target="_blank"
                >
                  {chunk}
                </Box>
              ),
            }}
          />
        </Text>
        {dataSetTwo.map(({ text }, index) => (
          <Box sx={{ display: 'flex' }} key={index}>
            <span>● </span>
            <LineItem>{text}</LineItem>
          </Box>
        ))}

        <ButtonContainer>
          {hasContestNFT !== BETA_ACCESS.CONFIRMED && (
            <>
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
              <Button
                size="large"
                to="/contest-leaderboard"
                sx={{
                  width: '300px',
                  fontFamily: 'Avenir Next',
                }}
              >
                <FormattedMessage defaultMessage={'View Full Leaderboard'} />
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
      margin-top: ${theme.spacing(11)};
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
