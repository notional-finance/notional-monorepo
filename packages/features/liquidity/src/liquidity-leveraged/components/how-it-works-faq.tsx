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
  const ProvideLiquidityImage = useHowItWorks(tokenSymbol);
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
            <BodyText sx={{ marginBottom: '0px' }}>
              <FormattedMessage
                defaultMessage={`When you provide liquidity, your funds are deposited into the n{tokenSymbol} account and you get n{tokenSymbol} in return. The n{tokenSymbol} account then routes your funds into Notional’s fixed rate liquidity pools so users can lend and borrow at fixed rates.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <ImageWrapper>
              <ProvideLiquidityImage />
            </ImageWrapper>
            <BodyText>
              <FormattedMessage
                defaultMessage={`The n{tokenSymbol} account is like an automated portfolio manager for your fixed rate liquidity. It gives you passive exposure to all active fixed rate liquidity pools and automatically rolls your liquidity forward when any pool matures.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>

            <H5
              sx={{
                color: theme.palette.typography.main,
                marginBottom: theme.spacing(2),
                marginTop: theme.spacing(4),
              }}
            >
              <FormattedMessage defaultMessage={`Fixed Rate Pools`} />
            </H5>
            <BodyText>
              <FormattedMessage
                defaultMessage={`Fixed rate pools hold liquidity as a combination of Prime {tokenSymbol} and f{tokenSymbol}. So as an LP, your capital is always earning a combination of Prime {tokenSymbol} yield and f{tokenSymbol} yield.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <Body>
              <FormattedMessage
                defaultMessage={`Prime {tokenSymbol} is {tokenSymbol} that is being lent at a variable rate on Notional and f{tokenSymbol} represents fixed rate lending positions.`}
                values={{
                  tokenSymbol,
                }}
              />
            </Body>

            <H5
              sx={{
                color: theme.palette.typography.main,
                marginBottom: theme.spacing(2),
                marginTop: theme.spacing(4),
              }}
            >
              <FormattedMessage defaultMessage={`Lending and Borrowing`} />
            </H5>
            <BodyText>
              <FormattedMessage
                defaultMessage={`By providing liquidity to the fixed rate liquidity pools, n{tokenSymbol} is the counter-party to fixed rate {tokenSymbol} lends and borrows on Notional.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <Body>
              <FormattedMessage
                defaultMessage={`When users lend fixed, n{tokenSymbol} borrows fixed. When users borrow fixed, n{tokenSymbol} lends fixed.`}
                values={{
                  tokenSymbol,
                }}
              />
            </Body>
            <Body>
              <FormattedMessage
                defaultMessage={`Lending and borrowing on the fixed rate pools generates fees for LPs and changes the amount of variable rate loans (Prime {tokenSymbol} vs. fixed rate loans (f{tokenSymbol}) they hold.`}
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
    margin-top: ${theme.spacing(4)};
    svg {
      width: 100%;
      height: 100%;
    }
  
  `
);

export default HowItWorksFaq;
