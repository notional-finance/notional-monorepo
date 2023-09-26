import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import Countdown from 'react-countdown';
import { Button } from '@notional-finance/mui';
import { ReactNode } from 'react';

interface ContestCountDownProps {
  title: ReactNode;
}

export const ContestCountDown = ({ title }: ContestCountDownProps) => {
  // This is a millisecond timestamp for 12 AM on 10/25/2023
  const futureDate = 1698210000000;
  return (
    <Container>
      <TitleText>{title}</TitleText>
      <ContentContainer>
        <Countdown
          date={futureDate}
          renderer={({ days, hours, minutes, seconds }) => {
            return (
              <CountDownContainer>
                <Box>{days}</Box>
                <Box>:</Box>
                <Box>{hours.toString().padStart(2, '0')}</Box>
                <Box>:</Box>
                <Box>{minutes.toString().padStart(2, '0')}</Box>
                <Box>:</Box>
                <Box>{seconds.toString().padStart(2, '0')}</Box>
              </CountDownContainer>
            );
          }}
        />
        <Button
          size="large"
          variant="outlined"
          to="/contest-rules"
          sx={{
            width: '358px',
            border: `1px solid ${colors.neonTurquoise}`,
            ':hover': {
              background: colors.matteGreen,
            },
            fontFamily: 'Avenir Next',
          }}
        >
          <FormattedMessage defaultMessage={'Contest Rules and Prizes'} />
        </Button>
      </ContentContainer>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      margin-top: ${theme.spacing(6)};
      `
);

const ContentContainer = styled(Box)(
  ({ theme }) => `
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-top: ${theme.spacing(6)};
      ${theme.breakpoints.down('md')} {
        flex-direction: column;
        align-items: center;
      }
      `
);

const CountDownContainer = styled(Box)(
  ({ theme }) => `
    font-family: Kunst;
    color: ${colors.white};
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 36px;
    font-style: normal;
    font-weight: 400;
    line-height: 52.645px;
    border: 1px solid ${colors.neonTurquoise};
    padding: 0px ${theme.spacing(3)};
    background: rgba(51, 248, 255, 0.10);
    width: 358px;
    height: 51px;
    ${theme.breakpoints.down('md')} {
     margin-bottom: ${theme.spacing(3)};
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
    letter-spacing: 10px;
  }
      `
);

export default ContestCountDown;
