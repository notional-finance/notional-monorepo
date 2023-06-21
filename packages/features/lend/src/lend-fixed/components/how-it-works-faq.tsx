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
                defaultMessage={`To Lend {tokenSymbol} at a fixed rate, you need to purchase f{tokenSymbol} from one of Notional’s {tokenSymbol} fixed rate liquidity pools.`}
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
                defaultMessage={`This allows you to get a fixed rate because you know how much f{tokenSymbol} you’re buying, and so you know exactly how much {tokenSymbol} you will have at maturity.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <BodyText sx={{ marginBottom: theme.spacing(4) }}>
              <FormattedMessage
                defaultMessage={`The difference between the amount of f{tokenSymbol} you buy and the amount of {tokenSymbol} you lend is the fixed amount of interest that you will earn between now and maturity.`}
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
                defaultMessage={`Fixed rate liquidity pools are Uniswap-like liquidity pools that allow you to trade between {tokenSymbol} and f{tokenSymbol} using an AMM. Fixed rate liquidity pools provide the liquidity you need to create a fixed rate loan.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <Body>
              <FormattedMessage
                defaultMessage={`Fixed rate liquidity pools also give you the option to exit early by allowing you to sell your f{tokenSymbol} on the pool before it matures.`}
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
              defaultMessage={'Fixed Rate Lending Documentation'}
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
  `
);

export default HowItWorksFaq;
