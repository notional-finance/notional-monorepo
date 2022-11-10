import { useTheme } from '@mui/material';
import Market from '@notional-finance/sdk/src/system/Market';
import { FormattedMessage } from 'react-intl';
import SliderBasic from '../../slider-basic/slider-basic';
import { H3, H4, H5 } from '../../typography/typography';

export interface VaultVariantProps {
  symbol: string;
  strategy: string;
  rate: number;
  minDepositRequired: string;
  capacityUsedPercentage: number;
}

export function VaultVariant({
  strategy,
  rate,
  symbol,
  minDepositRequired,
  capacityUsedPercentage,
}: VaultVariantProps) {
  const theme = useTheme();
  const formattedRate = `${Market.formatInterestRate(rate, 2)} APY`;
  return (
    <>
      <H4
        accent
        textAlign="left"
        marginTop={theme.spacing(6)}
        marginBottom={theme.spacing(1)}
        fontWeight="bold"
      >
        {symbol}
      </H4>
      <H3 textAlign="left" marginBottom={theme.spacing(4)} fontWeight="bold">
        {formattedRate}
      </H3>
      <H5 textAlign="left" marginBottom={theme.spacing(1)}>
        <FormattedMessage defaultMessage="Vault Type" />
      </H5>
      <H4 textAlign="left" marginBottom={theme.spacing(3)}>
        {strategy}
      </H4>
      <H5 textAlign="left" marginBottom={theme.spacing(1)}>
        <FormattedMessage defaultMessage="Minimum Deposit" />
      </H5>
      <H4 textAlign="left" marginBottom={theme.spacing(3)}>
        {minDepositRequired}
      </H4>
      <H5 textAlign="left" marginBottom={theme.spacing(1)}>
        <FormattedMessage defaultMessage="Capacity Used" />
      </H5>
      <SliderBasic min={0} max={100} value={capacityUsedPercentage} step={1} disabled={true} />
    </>
  );
}
