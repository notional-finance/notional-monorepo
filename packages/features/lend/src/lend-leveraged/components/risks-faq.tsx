import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { ExternalLink, Body, H5 } from '@notional-finance/mui';

export const RiskFaq = () => {
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
          defaultMessage={
            'A hack of Notional’s smart contracts or a protocol which Notional is integrated with could lead to a loss of funds.'
          }
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
          <FormattedMessage defaultMessage={'Mitigation: '} />
        </Box>{' '}
        <FormattedMessage
          defaultMessage={
            'Notional’s code has been audited multiple times by leading auditors.'
          }
        />
      </Body>
      <ExternalLink
        href="https://github.com/notional-finance/contracts-v2/blob/master/audits/README.md"
        textDecoration
        accent
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <FormattedMessage defaultMessage={'See all audits'} />
        <ExternalLinkIcon
          sx={{ fontSize: '12px', marginLeft: theme.spacing(0.5) }}
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
          <FormattedMessage defaultMessage={'Mitigation: '} />
        </Box>{' '}
        <FormattedMessage
          defaultMessage={
            'Conservative Risk parameters and significant liquidation discounts mean prompt liquidations and low probability of insolvency.'
          }
        />
      </Body>
    </Box>
  );
};

export default RiskFaq;
