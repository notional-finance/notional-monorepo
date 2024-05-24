import { Typography, styled, LinearProgress, Box } from '@mui/material';
import moment from 'moment';
import Countdown from 'react-countdown';
import { ThemeProvider } from '@mui/material/styles';
import { LargeInputTextEmphasized } from '../typography/typography';
import { FormattedMessage } from 'react-intl';

export interface CountdownProps {
  futureDate?: Date | string;
  totalDaysToCountDown?: number;
  completedCallback?: any;
  variant?: string;
}

const BorderLinearProgress = styled(LinearProgress)(
  ({ theme }) => `
  height: 4px;
  border-radius: ${theme.shape.borderRadius()};
  margin-top: 0.625rem;
  &.MuiLinearProgress-root {
    background-color: ${theme.palette.background.default};
    .MuiLinearProgress-bar {
      border-radius: ${theme.shape.borderRadius()};
      background: linear-gradient(90deg, #33F8FF -2.13%, #09636E 100%);
    };
  };
`
);

const CountDownNumber = styled(Box)(
  ({ theme: { palette } }) => `
  background-color: ${palette.background.default};
  border-radius: 15px;
  font-size: 3.125rem;
  text-align: center;
  margin-right: 5px;
  padding: 0.625rem;
  font-weight: 500;
  `
);

const SmallCountDownNumber = styled(LargeInputTextEmphasized)(
  () => `
  display: flex;
  justify-content: center;
  font-size: 32px;
`
);

const Label = styled(Typography)(
  ({ theme: { palette } }) => `
  text-align: center;
  font-size: 10px;
  color: ${palette.borders.accentPaper}; 
  margin-bottom: 0px;
`
);

const SmallCountDownContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
    border-radius: 6px;
    padding: 0px 10px;
    align-items: baseline;
    width: ${theme.spacing(37.5)};
`
);

const CountDownText = styled(Box)(
  ({ theme: { palette } }) => `
  background: ${palette.background.default};
  text-align: center;
  margin-right: 5px;
  margin-top: 5px;
  color: ${palette.primary.light};
  border-radius: 15px;
  padding: 0.625rem;
  text-transform: uppercase;
  `
);

const ContentBox = styled(Box)(
  ({ theme }) => `
    display: flex;    
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(2)};
    border-radius: ${theme.shape.borderRadius()};
    border: ${theme.shape.borderStandard};
    background: ${theme.palette.background.default};
    `
);

export const CountdownCards = ({
  futureDate,
  totalDaysToCountDown,
  completedCallback,
  variant = 'normal',
}: CountdownProps) => {
  const currentDate = new Date();
  const formattedFutureDate = moment(futureDate);
  const formattedCurrentDate = moment(currentDate);
  const numberOfHoursLeft = formattedFutureDate.diff(
    formattedCurrentDate,
    'hours'
  );
  const totalHours = totalDaysToCountDown ? totalDaysToCountDown * 24 : 0;
  const percentComplete = Math.trunc((numberOfHoursLeft / totalHours) * 100);

  return (
    <>
      {variant === 'small' && (
        <Countdown
          date={futureDate}
          intervalDelay={0}
          precision={3}
          renderer={({ days, hours, minutes, seconds, completed }) => {
            if (completedCallback && completed) {
              completedCallback();
              return <div></div>;
            } else {
              return (
                <ContentBox id="CONTENT BOX">
                  <SmallCountDownContainer>
                    <Box>
                      <SmallCountDownNumber>{days}</SmallCountDownNumber>
                      <Label>
                        <FormattedMessage defaultMessage={'Days'} />
                      </Label>
                    </Box>
                    <LargeInputTextEmphasized>:</LargeInputTextEmphasized>
                    <Box>
                      <SmallCountDownNumber>{hours}</SmallCountDownNumber>
                      <Label>
                        <FormattedMessage defaultMessage={'Hours'} />
                      </Label>
                    </Box>
                    <LargeInputTextEmphasized>:</LargeInputTextEmphasized>
                    <Box>
                      <SmallCountDownNumber>{minutes}</SmallCountDownNumber>
                      <Label>
                        <FormattedMessage defaultMessage={'Minutes'} />
                      </Label>
                    </Box>
                    <LargeInputTextEmphasized>:</LargeInputTextEmphasized>
                    <Box>
                      <SmallCountDownNumber>{seconds}</SmallCountDownNumber>
                      <Label>
                        <FormattedMessage defaultMessage={'Seconds'} />
                      </Label>
                    </Box>
                  </SmallCountDownContainer>
                </ContentBox>
              );
            }
          }}
        />
      )}
      {variant === 'normal' && (
        <>
          <Countdown
            date={formattedFutureDate.format()}
            intervalDelay={0}
            precision={3}
            renderer={({ days, hours, minutes, seconds, completed }) => {
              if (completedCallback && completed) {
                completedCallback();
                return <div></div>;
              } else {
                return (
                  <Box sx={{ display: 'flex' }}>
                    <Box sx={{ flex: '1' }}>
                      <CountDownNumber>{days}</CountDownNumber>
                      <CountDownText>
                        <FormattedMessage defaultMessage={'days'} />
                      </CountDownText>
                    </Box>
                    <Box sx={{ flex: '1' }}>
                      <CountDownNumber>{hours}</CountDownNumber>
                      <CountDownText>
                        <FormattedMessage defaultMessage={'hours'} />
                      </CountDownText>
                    </Box>
                    <Box sx={{ flex: '1' }}>
                      <CountDownNumber>{minutes}</CountDownNumber>
                      <CountDownText>
                        <FormattedMessage defaultMessage={'minutes'} />
                      </CountDownText>
                    </Box>
                    <Box sx={{ flex: '1' }}>
                      <CountDownNumber>{seconds}</CountDownNumber>
                      <CountDownText>
                        <FormattedMessage defaultMessage={'seconds'} />
                      </CountDownText>
                    </Box>
                  </Box>
                );
              }
            }}
          />
          <ThemeProvider
            theme={(outerTheme) => ({ ...outerTheme, direction: 'rtl' })}
          >
            <BorderLinearProgress
              variant="determinate"
              value={percentComplete}
            />
          </ThemeProvider>
        </>
      )}
    </>
  );
};

export default CountdownCards;
