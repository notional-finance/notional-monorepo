import { Player } from '@lottiefiles/react-lottie-player';
import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import {
  H5,
  H2,
  DiagramTitle,
  BodySecondary,
  SectionTitle,
} from '@notional-finance/mui';
import FullSize from './full-size.json';
import Cropped from './cropped.json';
import { useHowItWorks } from './use-how-it-works';

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
          <Box>
            {leftDataSet.map(({ title, bodyText, actionItems }, index) => (
              <CardContainer
                key={index}
                sx={{ height: index === 1 ? '280px' : '240px' }}
              >
                <DiagramTitle
                  sx={{ color: colors.black, marginBottom: theme.spacing(1) }}
                >
                  {title}
                </DiagramTitle>
                <BodySecondary
                  sx={{ color: colors.darkGrey, fontSize: '1rem' }}
                >
                  {bodyText}
                </BodySecondary>
                <Box
                  sx={{
                    position: 'relative',
                    alignSelf: 'end',
                    textAlign: 'right',
                  }}
                >
                  {actionItems.map((item) => (
                    <SectionTitle sx={{ color: colors.black }}>
                      {item}
                    </SectionTitle>
                  ))}
                </Box>
              </CardContainer>
            ))}
          </Box>
          <Player autoplay loop src={Cropped} id="lottie-player" />
          <Box>
            <Box>
              {rightDataSet.map(({ title, bodyText, actionItems }, index) => (
                <CardContainer
                  key={index}
                  sx={{ height: index === 1 ? '280px' : '240px' }}
                >
                  <DiagramTitle
                    sx={{ color: colors.black, marginBottom: theme.spacing(1) }}
                  >
                    {title}
                  </DiagramTitle>
                  <BodySecondary
                    sx={{ color: colors.darkGrey, fontSize: '1rem' }}
                  >
                    {bodyText}
                  </BodySecondary>
                  <Box sx={{ position: 'relative', alignSelf: 'end' }}>
                    {actionItems.map((item) => (
                      <SectionTitle sx={{ color: colors.black }}>
                        {item}
                      </SectionTitle>
                    ))}
                  </Box>
                </CardContainer>
              ))}
            </Box>
          </Box>
        </LottieContainer>
      </InnerContainer>
    </BackgroundContainer>
  );
};

const BackgroundContainer = styled(Box)(
  `
  height: 100%;
  width: 100%;
  background: ${colors.white};
    `
);

const InnerContainer = styled(Box)(
  ({ theme }) => `
  height: 100%;
  width: 1200px;
  margin: auto;
  padding-top: ${theme.spacing(15)};
  margin-bottom: ${theme.spacing(15)};
`
);

const LottieContainer = styled(Box)(
  ({ theme }) => `
  margin-top: 100px;
  height: 100%;
  width: 100%;
  display: flex;
  #lottie-player {
    width: 592px;
    padding-top: 135px;
  }
    `
);

const CardContainer = styled(Box)(
  ({ theme }) => `
  display: grid;
  width: 300px;
  background: ${colors.white};
  border-radius: ${theme.shape.borderRadius()};
  border: 1px solid ${colors.purpleGrey};
  box-shadow: 0px 4px 10px rgba(20, 42, 74, 0.12);
  margin-bottom: ${theme.spacing(6)};
  padding: ${theme.spacing(4)};
    `
);

export default HowItWorks;
