import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import Countdown from 'react-countdown';
import { Button } from '@notional-finance/mui';

// generate a future date for the countdown 6 months from now

export const ContestCountDown = () => {
  // This is a millisecond timestamp for 5 months from now
  const futureDate = 1703982091000;
  return (
    <Container>
      <TitleText>
        <FormattedMessage defaultMessage={'v3 Beta Contest '} />
      </TitleText>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
      >
        <Countdown
          date={futureDate}
          renderer={({ days, hours, minutes, seconds }) => {
            return (
              <CountDownContainer>
                <Box>{days}</Box>
                <Box>:</Box>
                <Box>{hours}</Box>
                <Box>:</Box>
                <Box>{minutes}</Box>
                <Box>:</Box>
                <Box>{seconds}</Box>
              </CountDownContainer>
            );
          }}
        />
        <Button
          size="large"
          variant="outlined"
          sx={{
            width: '358px',
            ':hover': {
              background: colors.matteGreen,
            },
            fontFamily: 'Avenir Next',
          }}
        >
          <FormattedMessage defaultMessage={'Contest Rules and Prizes'} />
        </Button>
      </Box>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      margin-top: ${theme.spacing(20)};
      `
);

const CountDownContainer = styled(Box)(
  ({ theme }) => `
    font-family: Avenir Next;
    color: ${colors.white};
    display: flex;
    justify-content: space-between;
    font-size: 36px;
    font-style: normal;
    font-weight: 400;
    line-height: 52.645px;
    border: 1px solid ${colors.neonTurquoise};
    padding: 0px ${theme.spacing(3)};
    background: rgba(51, 248, 255, 0.10);
    width: 358px;
    height: 51px;
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

      `
);

export default ContestCountDown;
