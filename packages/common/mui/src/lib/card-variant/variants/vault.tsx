import { Box, useTheme } from '@mui/material';
import Market from '@notional-finance/sdk/src/system/Market';
import { FormattedMessage } from 'react-intl';
import SliderBasic from '../../slider-basic/slider-basic';
import { BodySecondary, H3, H5, LabelValue } from '../../typography/typography';

export interface VaultVariantProps {
  symbol: string;
  vaultName: string;
  rate: number;
  minDepositRequired: string;
  capacityUsedPercentage: number;
  capacityRemaining: string;
}

export function VaultVariant({
  vaultName,
  rate,
  symbol,
  minDepositRequired,
  capacityUsedPercentage,
  capacityRemaining,
}: VaultVariantProps) {
  const theme = useTheme();
  const formattedRate = `${Market.formatInterestRate(rate, 2)} APY`;
  return (
    <>
      <H3 accent textAlign="left" marginBottom={theme.spacing(1)}>
        {symbol}
      </H3>
      <LabelValue textAlign="left" marginBottom={theme.spacing(4)}>
        {vaultName}
      </LabelValue>
      <H5 textAlign="left" gutter="default">
        <FormattedMessage defaultMessage="Estimated Return" />
      </H5>
      <H3 textAlign="left" marginBottom={theme.spacing(3)} fontWeight="bold">
        {formattedRate}
      </H3>
      <H5 textAlign="left" marginBottom={theme.spacing(1)}>
        <FormattedMessage defaultMessage="Minimum Deposit" />
      </H5>
      <LabelValue textAlign="left" marginBottom={theme.spacing(5)}>
        {minDepositRequired}
      </LabelValue>
      <H5 textAlign="left">
        <FormattedMessage defaultMessage="Vault Borrow Capacity" />
      </H5>
      <SliderBasic
        min={0}
        max={100}
        value={capacityUsedPercentage}
        step={1}
        disabled={true}
        sx={{
          marginBottom: theme.spacing(0),
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing(3),
        }}
      >
        <H5 inline textAlign="left">
          <FormattedMessage defaultMessage="Capacity Remaining" />
        </H5>
        <BodySecondary
          sx={{ color: theme.palette.typography.main }}
          fontWeight="bold"
          inline
          textAlign="right"
        >
          {capacityRemaining}
        </BodySecondary>
      </Box>
    </>
  );
}
