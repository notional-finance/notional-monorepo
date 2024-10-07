import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { ExternalLink, Body, H5 } from '@notional-finance/mui';
import { useVaultStrategyData } from '../hooks';
import { REINVESTMENT_TYPE } from '@notional-finance/util';

interface RiskFaqProps {
  currentVaultType: REINVESTMENT_TYPE | undefined;
}

export const RiskFaq = ({ currentVaultType }: RiskFaqProps) => {
  const theme = useTheme();
  const vaultStrategyData = useVaultStrategyData();

  if (!vaultStrategyData) return null;

  const { primaryBorrowCurrency, poolName } = vaultStrategyData;

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
          defaultMessage={`A hack of Notional's smart contracts or a protocol which Notional is integrated with could lead to a loss of funds.`}
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
        <FormattedMessage defaultMessage={'Price / liquidation Risk'} />
      </H5>
      <Body sx={{ marginBottom: theme.spacing(2) }}>
        {currentVaultType !== REINVESTMENT_TYPE.PENDLE_PT ? (
          <FormattedMessage
            defaultMessage={
              'If the price of {primaryBorrowCurrency} changes relative to the other tokens in the {poolName} pool, you could make or lose money. If it moves past your liquidation price, you could get liquidated.'
            }
            values={{
              primaryBorrowCurrency,
              poolName,
            }}
          />
        ) : (
          <FormattedMessage
            defaultMessage={
              'If the price of {primaryBorrowCurrency} changes relative to the PT price, you could make or lose money. If it moves past your liquidation price, you could get liquidated.'
            }
            values={{
              primaryBorrowCurrency,
              poolName,
            }}
          />
        )}
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
        <FormattedMessage defaultMessage={'Don’t max out your leverage.'} />
      </Body>
      <H5
        sx={{
          color: theme.palette.typography.main,
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
        }}
      >
        <FormattedMessage defaultMessage={'Negative apy risk'} />
      </H5>
      <Body sx={{ marginBottom: theme.spacing(2) }}>
        <FormattedMessage
          defaultMessage={`If the strategy APY falls below your borrow APY, your total APY could become negative.`}
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
          defaultMessage={`Borrow at a fixed rate to avoid unexpected borrow rate spikes.`}
        />
      </Body>
    </Box>
  );
};

export default RiskFaq;
