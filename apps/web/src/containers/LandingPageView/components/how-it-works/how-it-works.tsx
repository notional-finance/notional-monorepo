import { Box, styled } from '@mui/material';
// import { Box, styled, useTheme } from '@mui/material';
// import { colors } from '@notional-finance/styles';
// import { FormattedMessage } from 'react-intl';
// import { H5, H2 } from '@notional-finance/mui';

export const HowItWorks = () => {
  //   const theme = useTheme();
  // NOTE* This will be used once we have the lottie animation
  return (
    <Container>
      {/* <Box>
        <H5 sx={{ color: colors.aqua, marginBottom: theme.spacing(2) }}>
          <FormattedMessage defaultMessage={'How it Works'} />
        </H5>
        <H2>
          <FormattedMessage defaultMessage={'How Notional Maximizes Returns'} />
        </H2> 
      </Box> */}
    </Container>
  );
};

const Container = styled(Box)(
  () => `
    height: 200px;
    width: 1200px;
    margin: auto;
`
);

export default HowItWorks;
