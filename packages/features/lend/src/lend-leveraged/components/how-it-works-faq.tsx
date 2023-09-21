import { Body, ExternalLink, H5 } from '@notional-finance/mui';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { Box, useTheme, styled } from '@mui/material';
import { FCashExample } from './fcash-example';
import { FormattedMessage } from 'react-intl';

interface HowItWorksFaqProps {
  tokenSymbol: string;
}

export const HowItWorksFaq = ({ tokenSymbol }: HowItWorksFaqProps) => {
  const theme = useTheme();

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
                defaultMessage={`A leveraged lend is an interest rate arbitrage position that borrows from one maturity and lends to a different maturity.`}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`A leveraged lend either borrows variable and lends fixed, or lends variable and borrows fixed. The variable rate loan comes from Notional’s variable rate lending market and the fixed rate loan comes from buying or selling f{tokenSymbol}.`}
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
                textTransform: 'uppercase',
              }}
            >
              <FormattedMessage
                defaultMessage={`What is f{tokenSymbol}?`}
                values={{
                  tokenSymbol,
                }}
              />
            </H5>
            <FCashExample tokenSymbol={tokenSymbol} />
            <H5
              sx={{
                color: theme.palette.typography.main,
                marginBottom: theme.spacing(2),
                marginTop: theme.spacing(4),
                textTransform: 'uppercase',
              }}
            >
              <FormattedMessage
                defaultMessage={`f{tokenSymbol} / {tokenSymbol} Price Risk`}
                values={{
                  tokenSymbol,
                }}
              />
            </H5>

            <BodyText>
              <FormattedMessage
                defaultMessage={`The f{tokenSymbol} / {tokenSymbol} price will always equal 1 at maturity. But before maturity, this price can fluctuate.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`When the fixed rate increases, the f{tokenSymbol} / {tokenSymbol} price decreases. When the fixed rate decreases, the f{tokenSymbol} / {tokenSymbol} price increases.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`This can cause unrealized profit or loss for leveraged lending positions and potentially even liquidation.`}
              />
            </BodyText>
          </Box>
          <ExternalLink
            href="https://docs.notional.finance/notional-v3/product-guides/leveraged-lending"
            textDecoration
            accent
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: theme.spacing(3),
            }}
          >
            <FormattedMessage
              defaultMessage={'Leveraged Lending Documentation'}
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

export default HowItWorksFaq;
