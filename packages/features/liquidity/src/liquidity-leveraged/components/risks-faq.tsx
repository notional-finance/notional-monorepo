import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { ExternalLink, Body, H5 } from '@notional-finance/mui';

interface RiskFaqProps {
  tokenSymbol: string;
}

export const RiskFaq = ({ tokenSymbol }: RiskFaqProps) => {
  const theme = useTheme();
  return (
    <Box>
      <H5
        sx={{
          color: theme.palette.typography.main,
          marginBottom: theme.spacing(2),
        }}
      >
        <FormattedMessage defaultMessage={'Smart Contract Risk'} />
      </H5>
      <Body>
        <FormattedMessage
          defaultMessage={`A hack of Notional’s smart contracts or a protocol which Notional is integrated with could lead to a loss of funds.`}
        />
      </Body>
      <Body
        sx={{
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(2),
        }}
      >
        <Box
          component={'span'}
          sx={{
            color: theme.palette.typography.main,
          }}
        >
          <FormattedMessage defaultMessage={'Migration: '} />
        </Box>{' '}
        <FormattedMessage
          defaultMessage={
            'Notional’s code has been audited multiple times by leading auditors.'
          }
        />
      </Body>
      {/* TODO: Add LINK */}
      <ExternalLink
        href=""
        textDecoration
        accent
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <FormattedMessage defaultMessage={'See all audits'} />
        <ExternalLinkIcon
          sx={{ height: theme.spacing(1.5), marginLeft: theme.spacing(0.5) }}
        />
      </ExternalLink>
      <H5
        sx={{
          color: theme.palette.typography.main,
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
        }}
      >
        <FormattedMessage defaultMessage={'Bad Debt Risk'} />
      </H5>
      <Body sx={{ marginBottom: theme.spacing(2) }}>
        <FormattedMessage
          defaultMessage={
            'A borrower’s insolvency on Notional due to liquidation failure could lead to a loss of funds.'
          }
        />
      </Body>
      <Body>
        <Box
          component={'span'}
          sx={{
            color: theme.palette.typography.main,
          }}
        >
          <FormattedMessage defaultMessage={'Migration: '} />
        </Box>{' '}
        <FormattedMessage
          defaultMessage={
            'Conservative Risk parameters and significant liquidation discounts mean prompt liquidations and low probability of insolvency.'
          }
        />
      </Body>
      <H5
        sx={{
          color: theme.palette.typography.main,
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
        }}
      >
        <FormattedMessage defaultMessage={'Impermanent Loss'} />
      </H5>
      <Body sx={{ marginBottom: theme.spacing(2) }}>
        <FormattedMessage
          defaultMessage={`As fixed interest rates move, n{tokenSymbol} can become a fixed rate borrower or a fixed rate lender. Changes in n{tokenSymbol}’s borrowing and lending positions can affect the n{tokenSymbol}/{tokenSymbol} price.`}
          values={{
            tokenSymbol,
          }}
        />
      </Body>
      <Body>
        <Box
          component={'span'}
          sx={{
            color: theme.palette.typography.main,
          }}
        >
          <FormattedMessage defaultMessage={'Migration: '} />
        </Box>{' '}
        <FormattedMessage
          defaultMessage={`Bounded fixed interest rate ranges limit potential IL.`}
        />
      </Body>

      <H5
        sx={{
          color: theme.palette.typography.main,
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
        }}
      >
        <FormattedMessage defaultMessage={'Redemption Risk'} />
      </H5>
      <Body sx={{ marginBottom: theme.spacing(2) }}>
        <FormattedMessage
          defaultMessage={`High utilization of fixed rate liquidity can make n{tokenSymbol} temporarily unredeemable for {tokenSymbol}.`}
          values={{
            tokenSymbol,
          }}
        />
      </Body>
      <Body>
        <Box
          component={'span'}
          sx={{
            color: theme.palette.typography.main,
          }}
        >
          <FormattedMessage defaultMessage={'Migration: '} />
        </Box>{' '}
        <FormattedMessage
          defaultMessage={`High utilization increases interest rates and incentivizes users to lend which re-enables n{tokenSymbol} redemption for {tokenSymbol}.`}
          values={{
            tokenSymbol,
          }}
        />
      </Body>
    </Box>
  );
};

export default RiskFaq;
