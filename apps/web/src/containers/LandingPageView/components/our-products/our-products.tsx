import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { ProductCards } from './components/product-cards';
import { H5, H2, Label } from '@notional-finance/mui';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import earn from './assets/earn.json';
import borrow from './assets/borrow.json';
import leverage from './assets/leverage.json';
import { Network } from '@notional-finance/util';

const cardData = [
  {
    title: <FormattedMessage defaultMessage={'Earn'} />,
    text: (
      <FormattedMessage
        defaultMessage={'Passive yield products that are easy and low risk.'}
      />
    ),
    pillOne: <FormattedMessage defaultMessage={'Easy'} />,
    pillTwo: <FormattedMessage defaultMessage={'Low Risk'} />,
    link: `/portfolio/${Network.mainnet}/welcome/earn`,
    linkTitle: <FormattedMessage defaultMessage={'Earn Products'} />,
    lottieFile: earn,
  },
  {
    title: <FormattedMessage defaultMessage={'Leverage'} />,
    text: (
      <FormattedMessage
        defaultMessage={
          'Maximum yield using leveraged strategies. For active users.'
        }
      />
    ),
    pillOne: <FormattedMessage defaultMessage={'Advanced'} />,
    link: `/portfolio/${Network.mainnet}/welcome/leverage`,
    linkTitle: <FormattedMessage defaultMessage={'Leverage Products'} />,
    lottieFile: leverage,
  },
  {
    title: <FormattedMessage defaultMessage={'Borrow'} />,
    text: (
      <FormattedMessage
        defaultMessage={
          'Borrow against crypto asset collateral at fixed or variable rates.'
        }
      />
    ),
    pillOne: <FormattedMessage defaultMessage={'Over-Collateralized'} />,
    link: `/portfolio/${Network.mainnet}/welcome/borrow`,
    linkTitle: <FormattedMessage defaultMessage={'Borrow Products'} />,
    lottieFile: borrow,
  },
];

export const OurProducts = () => {
  const theme = useTheme();

  return (
    <Box sx={{ zIndex: 3, position: 'relative', background: colors.iceWhite }}>
      <Container>
        <TitleContainer>
          <Box id="title-text">
            <H5
              sx={{
                color: colors.neonTurquoise,
                marginBottom: theme.spacing(2),
              }}
            >
              <FormattedMessage defaultMessage={'Our Products'} />
            </H5>
            <H2
              sx={{
                color: colors.white,
                lineHeight: theme.spacing(5),
              }}
            >
              <FormattedMessage defaultMessage={'With Notional You Can'} />
            </H2>
          </Box>
          <Box id="supported-networks">
            <H5
              sx={{
                color: colors.neonTurquoise,
                marginBottom: theme.spacing(2),
              }}
            >
              <FormattedMessage defaultMessage={'Supported Networks'} />
            </H5>
            <Box sx={{ display: 'flex' }}>
              <NetworkLabel sx={{ marginRight: theme.spacing(2) }}>
                <TokenIcon
                  symbol="eth"
                  size={'large'}
                  style={{ marginRight: theme.spacing(1) }}
                />
                Mainnet
              </NetworkLabel>
              <NetworkLabel>
                <TokenIcon
                  symbol="arb"
                  size={'large'}
                  style={{ marginRight: theme.spacing(1) }}
                />
                Arbitrum
              </NetworkLabel>
            </Box>
          </Box>
        </TitleContainer>
        <FlexWrapper>
          {cardData.map(
            (
              { title, link, text, pillOne, pillTwo, lottieFile, linkTitle },
              index
            ) => (
              <ProductCards
                key={index}
                title={title}
                link={link}
                linkTitle={linkTitle}
                text={text}
                pillOne={pillOne}
                pillTwo={pillTwo}
                lottieFile={lottieFile}
              />
            )
          )}
        </FlexWrapper>
      </Container>
    </Box>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    z-index: 2;
    width: 1362px;
    height: 100%;
    margin: auto;
    top: -${theme.spacing(4)};
    position: relative;
    background: ${colors.black};
    padding: ${theme.spacing(10)};
    border-radius: ${theme.shape.borderRadiusLarge};
    border: ${theme.shape.borderHighlight};
    box-shadow: 0px 34px 50px -15px rgba(20, 42, 74, 0.3);
    @media(min-height: 800px) {
      top: -${theme.spacing(7.5)};
    }

    ${theme.breakpoints.down('mdLanding')} {
      width: ${theme.spacing(125)};
      height: 100%;
      padding: ${theme.spacing(6)};
    }

    ${theme.breakpoints.down('smLanding')} {
      width: 90%;
      height: 100%;
      padding: ${theme.spacing(6)};
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
      padding: 0px;
      margin-bottom: ${theme.spacing(11)};
      background: transparent;
      box-shadow: none;
      border: none;
      width: 90%;
      top: 0;
    }
  `
);

const TitleContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
    align-items: end;
    #supported-networks {
      text-align: right;
    }
    margin-bottom: ${theme.spacing(9)};
    ${theme.breakpoints.down('smLanding')} {
      align-items: flex-start;
      flex-direction: column;
      h2 {
        margin-bottom: ${theme.spacing(7)};
      }
      #supported-networks {
        text-align: left;
      }
    }
    ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
      margin-top: ${theme.spacing(11)};
      width: 100%;
      align-items: center;
      #title-text, #supported-networks {
        width: 100%;
      }
      #supported-networks {
        text-align: left;
      }
      h2 {
        color: ${colors.black};
      }
      h5 {
        color: ${colors.aqua};
        font-size: 1rem;
        font-weight: 600;
      }
    }
  `
);

const FlexWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  gap: ${theme.spacing(7.5)};
  flex-wrap: wrap;
  justify-content: center;
    ${theme.breakpoints.down('smLanding')} {
      flex-direction: column;
    }
  `
);

const NetworkLabel = styled(Label)(
  ({ theme }) => `
  color: ${colors.white};
  background: ${colors.darkGreen};
  border: 1px solid ${colors.blueGreen};
  border-radius: 50px;
  display: flex;
  align-items: center;
  width: ${theme.spacing(18.5)};
  height: ${theme.spacing(6)};
  padding: ${theme.spacing(1)};
  `
);

export default OurProducts;
