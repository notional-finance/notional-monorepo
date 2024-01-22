import { Box, SxProps, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import Countdown from 'react-countdown';
import { SectionTitle } from '@notional-finance/mui';
import { ReactNode } from 'react';

interface ContestCountDownProps {
  title?: ReactNode;
  sx?: SxProps;
}

export const ContestCountDown = ({ title, sx }: ContestCountDownProps) => {
  const theme = useTheme();
  // This is a millisecond timestamp for 12 AM on 02/01/2024
  const futureDate = 1706832000000;

  return (
    <Box
      sx={{
        marginBottom: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'baseline',
        ...sx,
      }}
    >
      {title && <SectionTitle>{title}</SectionTitle>}
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
    </Box>
  );
};

const CountDownContainer = styled(Box)(
  ({ theme }) => `
    margin-top: ${theme.spacing(1)};
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
    width: 330px;
    height: 51px;
      `
);

export default ContestCountDown;
