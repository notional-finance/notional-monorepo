import { Body, ExternalLink, H5 } from '@notional-finance/mui';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { Box, useTheme, styled } from '@mui/material';
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
                defaultMessage={`A Leveraged liquidity transaction allows you to provide liquidity, borrow against that liquidity, and then provide more liquidity.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`Leveraged liquidity allows you to earn the spread between the liquidity yield and the borrow rate that you choose.`}
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
                defaultMessage={`What is n{tokenSymbol}?`}
                values={{
                  tokenSymbol,
                }}
              />
            </H5>
            <BodyText>
              <FormattedMessage
                defaultMessage={`n{tokenSymbol} is the token you receive when you provide {tokenSymbol} liquidity. n{tokenSymbol} automates providing liquidity to all of Notional’s {tokenSymbol} fixed rate liquidity pools.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`n{tokenSymbol} gives you a passive return from interest accrual on assets in the fixed rate liquidity pools, transaction fees, and NOTE incentives.`}
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
                defaultMessage={`n{tokenSymbol} / {tokenSymbol} Price Risk`}
                values={{
                  tokenSymbol,
                }}
              />
            </H5>
            <BodyText>
              <FormattedMessage
                defaultMessage={`The n{tokenSymbol} / {tokenSymbol} price gradually increases as n{tokenSymbol} accrues interest and earns fees. However, because n{tokenSymbol} is providing liquidity to fixed rate liquidity pools, it can also have IL as fixed interest rates move.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`The more fixed rates move, the larger the potential IL hit for the n{tokenSymbol} / {tokenSymbol} price. n{tokenSymbol} IL is generally very low, but it can cause liquidation for highly leveraged liquidity positions.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
          </Box>
          <ExternalLink
            href="https://docs.notional.finance/notional-v3/product-guides/leveraged-liquidity"
            textDecoration
            accent
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: theme.spacing(3),
            }}
          >
            <FormattedMessage
              defaultMessage={'Leveraged Liquidity Documentation'}
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
