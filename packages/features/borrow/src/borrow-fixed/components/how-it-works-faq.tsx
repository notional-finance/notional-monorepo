import { Body, ExternalLink, H5 } from '@notional-finance/mui';
// TODO: Create a place to house images like this one where they can be shared from
import { useHowItWorks } from '../hooks/use-how-it-works';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { Box, useTheme, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface HowItWorksFaqProps {
  tokenSymbol: string;
}

export const HowItWorksFaq = ({ tokenSymbol }: HowItWorksFaqProps) => {
  const theme = useTheme();
  const image = useHowItWorks(tokenSymbol);
  return (
    <div>
      {tokenSymbol && (
        <>
          <Box
            sx={{
              background: theme.palette.background.default,
              padding: theme.spacing(3),
              border: theme.shape.borderStandard,
              borderRadius: theme.shape.borderRadius(),
            }}
          >
            <BodyText>
              <FormattedMessage
                defaultMessage={`To borrow {tokenSymbol} at a fixed rate, you will mint f{tokenSymbol}and swap it on one of Notional’s fixed rate liquidity pools in exchange for {tokenSymbol}.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`f{tokenSymbol} is a token that is redeemable for the same amount of {tokenSymbol} on its maturity date. For example, 100 f{tokenSymbol} is redeemable for 100 {tokenSymbol} at maturity.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <ImageWrapper>
              <img src={image} alt="graphic" />
            </ImageWrapper>

            <BodyText>
              <FormattedMessage
                defaultMessage={`By minting and selling the f{tokenSymbol}, you now have a f{tokenSymbol} debt position. This means that you owe a fixed amount of {tokenSymbol} at maturity.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <BodyText sx={{ marginBottom: theme.spacing(4) }}>
              <FormattedMessage
                defaultMessage={`The difference between the amount of f{tokenSymbol} you sell and the amount of {tokenSymbol} you receive is the fixed amount of interest you owe between now and maturity.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <H5
              sx={{
                color: theme.palette.typography.main,
                marginBottom: theme.spacing(2),
              }}
            >
              <FormattedMessage
                defaultMessage={`What are fixed rate liquidity pools?`}
              />
            </H5>
            <BodyText>
              <FormattedMessage
                defaultMessage={`Fixed rate liquidity pools are Uniswap-like liquidity pools that allow you to swap between {tokenSymbol} and f{tokenSymbol} using an AMM. Fixed rate liquidity pools provide the liquidity you need to create a fixed rate loan.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <Body>
              <FormattedMessage
                defaultMessage={`Fixed rate liquidity pools also give you the option to close your loan early by buying back the f{tokenSymbol} you sold before maturity.`}
                values={{
                  tokenSymbol,
                }}
              />
            </Body>
          </Box>
          {/* TODO: ADD LINK TO DOCS */}
          <ExternalLink
            href=""
            textDecoration
            accent
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: theme.spacing(3),
            }}
          >
            <FormattedMessage
              defaultMessage={'Fixed Rate Borrowing Documentation'}
            />
            <ExternalLinkIcon
              sx={{ fontSize: '12px', marginLeft: theme.spacing(0.5) }}
            />
          </ExternalLink>
        </>
      )}
    </div>
  );
};

const BodyText = styled(Body)(
  ({ theme }) => `
    margin-bottom: ${theme.spacing(2)};
  `
);

const ImageWrapper = styled(Box)(
  ({ theme }) => `
    margin-bottom: ${theme.spacing(4)};
    margin-top: ${theme.spacing(4)};
    img {
      width: 100%;
    }
  `
);

export default HowItWorksFaq;
