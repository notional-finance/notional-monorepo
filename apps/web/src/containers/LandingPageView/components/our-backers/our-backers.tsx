import { FormattedMessage } from 'react-intl';
import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { H5, H2 } from '@notional-finance/mui';
import { ImageSlider, UserCards } from './components';

export const OurBackers = () => {
  const theme = useTheme();

  return (
    <BackgroundContainer>
      <InnerContainer>
        <Box sx={{ marginBottom: theme.spacing(3) }}>
          <H5
            sx={{ color: colors.neonTurquoise, marginBottom: theme.spacing(2) }}
          >
            <FormattedMessage defaultMessage={'Our Backers'} />
          </H5>
          <H2 sx={{ color: colors.white, marginBottom: '0px' }}>
            <FormattedMessage
              defaultMessage={'World-Class Investors, Enthusiastic Users'}
            />
          </H2>
        </Box>
      </InnerContainer>
      <ImageSlider />
      <InnerContainer sx={{ paddingTop: theme.spacing(6) }}>
        <UserCards />
      </InnerContainer>
    </BackgroundContainer>
  );
};

const BackgroundContainer = styled(Box)(
  `
        height: 100%;
        width: 100%;
        background: ${colors.black};
    `
);

const InnerContainer = styled(Box)(
  ({ theme }) => `
        width: ${theme.spacing(150)};
        margin: auto;
        padding-top: ${theme.spacing(15)};
        padding-bottom: ${theme.spacing(12.5)};
        ${theme.breakpoints.down('mdLanding')} {
          width: ${theme.spacing(125)};
        }
        ${theme.breakpoints.down('smLanding')} {
            width: 90%;
        }
    `
);

export default OurBackers;
