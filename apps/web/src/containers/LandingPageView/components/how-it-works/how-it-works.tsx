import { Player } from '@lottiefiles/react-lottie-player';
import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { H5, H2 } from '@notional-finance/mui';
import Cropped from './images/cropped.json';
import NotionalCircle from './images/notional-circle.svg';
import { useHowItWorks } from './use-how-it-works';
import { Card } from './components/card';

export const HowItWorks = () => {
  const theme = useTheme();
  const { leftDataSet, rightDataSet } = useHowItWorks();

  return (
    <BackgroundContainer>
      <InnerContainer>
        <Box>
          <H5 sx={{ color: colors.aqua, marginBottom: theme.spacing(2) }}>
            <FormattedMessage defaultMessage={'How it Works'} />
          </H5>
          <H2 sx={{ color: colors.black }}>
            <FormattedMessage
              defaultMessage={'How Notional Maximizes Returns'}
            />
          </H2>
        </Box>
        <LottieContainer>
          <Box sx={{ zIndex: 3, position: 'relative' }}>
            {leftDataSet.map((data, index) => (
              <Card key={index} parentIndex={index} cardSet="left" {...data} />
            ))}
          </Box>
          <Player autoplay loop src={Cropped} id="lottie-player" />
          <Box sx={{ position: 'absolute' }}>
            <img
              src={NotionalCircle}
              alt="notional circle"
              style={{
                height: theme.spacing(38.125),
                left: theme.spacing(55.5),
                top: theme.spacing(20.75),
                position: 'relative',
              }}
            />
          </Box>
          <Box>
            {rightDataSet.map((data, index) => (
              <Card key={index} parentIndex={index} cardSet="right" {...data} />
            ))}
          </Box>
        </LottieContainer>
      </InnerContainer>
    </BackgroundContainer>
  );
};

const BackgroundContainer = styled(Box)(
  ({ theme }) => `
  height: 100%;
  width: 100%;
  background: ${colors.white};
  ${theme.breakpoints.down('md')} {
    height: ${theme.spacing(10)};
  }
    `
);

const InnerContainer = styled(Box)(
  ({ theme }) => `
  height: 100%;
  width: 1200px;
  margin: auto;
  padding-top: ${theme.spacing(7)};
  margin-bottom: ${theme.spacing(15)};
  ${theme.breakpoints.down('md')} {
    display: none;
  }

`
);

const LottieContainer = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(12.5)};
  height: 100%;
  width: 100%;
  display: flex;
  #lottie-player {
    width: ${theme.spacing(74)};
    padding-top: ${theme.spacing(19.375)};
  }
    `
);

export default HowItWorks;
