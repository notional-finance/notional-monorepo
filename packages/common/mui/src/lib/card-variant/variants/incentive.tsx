import { useTheme } from '@mui/material';
import { Market } from '@notional-finance/sdk/src/system';
import { FormattedMessage } from 'react-intl';
import { CurrencyVariant } from './currency';
import { PlusIcon } from '@notional-finance/icons';
import { H4, H3, H5 } from '../../typography/typography';

export interface IncentiveVariantProps {
  symbol: string;
  rate: number;
  incentiveRate?: number;
}

export function IncentiveVariant({ symbol, rate, incentiveRate }: IncentiveVariantProps) {
  const theme = useTheme();
  if (!incentiveRate) {
    return <CurrencyVariant symbol={symbol} rate={rate} />;
  }

  const formattedTotalRate = `${Market.formatInterestRate(rate + incentiveRate, 2)} APY`;
  const formattedRate = `${Market.formatInterestRate(rate, 2)} APY`;
  const formattedIncentiveRate = `${Market.formatInterestRate(incentiveRate, 2)} APY`;
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
        {formattedTotalRate}
      </H3>
      <H5 textAlign="left" marginBottom={theme.spacing(1)}>
        <FormattedMessage defaultMessage="Variable Yield" />
      </H5>
      <H4 textAlign="left" marginBottom={theme.spacing(3)} fontWeight="bold">
        {formattedRate}
      </H4>
      <H5 textAlign="left" marginBottom={theme.spacing(1)}>
        <PlusIcon width={'9px'} />
        <FormattedMessage defaultMessage="NOTE Incentive Yield" />
      </H5>
      <H4 textAlign="left" marginBottom={theme.spacing(3)} fontWeight="bold">
        {formattedIncentiveRate}
      </H4>
    </>
  );
}
