import { FormattedMessage } from 'react-intl';
// import { useInView } from 'react-intersection-observer';
// import panteraSvg from '@notional-finance/assets/marketing/partners/pantera.svg';
// import spartanSvg from '@notional-finance/assets/marketing/partners/spartan.svg';
// import ideoCoLabSvg from '@notional-finance/assets/marketing/partners/ideo-colab.svg';
// import oneCSvg from '@notional-finance/assets/marketing/partners/1c.svg';
// import coinbaseVenturesSvg from '@notional-finance/assets/marketing/partners/coinbase-ventures.svg';
// import parafiSvg from '@notional-finance/assets/marketing/partners/parafi.svg';
// import nascentSvg from '@notional-finance/assets/marketing/partners/nascent.svg';
import { Box, styled, useTheme } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { colors } from '@notional-finance/styles';
import { H5, H2 } from '@notional-finance/mui';

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
          <H2 sx={{ color: colors.white }}>
            <FormattedMessage
              defaultMessage={'World-Class Investors, Enthusiastic Users'}
            />
          </H2>
        </Box>
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
        padding-bottom: ${theme.spacing(15)};
        ${theme.breakpoints.down(1220)} {
          width: ${theme.spacing(125)};
        }
        ${theme.breakpoints.down(1000)} {
            width: 90%;
        }
    `
);

export default OurBackers;
