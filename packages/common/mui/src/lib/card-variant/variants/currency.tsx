import { useTheme } from '@mui/material';
import { H3, H4 } from '../../typography/typography';
import { Market } from '@notional-finance/sdk/src/system';
import { FormattedMessage } from 'react-intl';

export interface CurrencyVariantProps {
  symbol: string;
  rate: number;
}

export function CurrencyVariant({ symbol, rate }: CurrencyVariantProps) {
  const theme = useTheme();
  const formattedRate = Market.formatInterestRate(rate, 2);
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
        <FormattedMessage
          defaultMessage="{formattedRate} Fixed APY"
          values={{
            formattedRate: formattedRate,
          }}
        />
      </H3>
    </>
  );
}
