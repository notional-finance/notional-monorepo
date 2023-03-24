import { useTheme, Box } from '@mui/material';
import { CurrencyTitle, H4, Caption } from '../../typography/typography';
import { Market } from '@notional-finance/sdk/src/system';
import { FormattedMessage } from 'react-intl';

export interface CurrencyVariantProps {
  symbol: string;
  rate: number;
  isVariable?: boolean;
  hovered: boolean;
}

export function CurrencyVariant({
  symbol,
  rate,
  isVariable,
  hovered,
}: CurrencyVariantProps) {
  const theme = useTheme();
  const formattedRate = Market.formatInterestRate(rate, 2);

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <CurrencyTitle
        accent
        textAlign="left"
        fontWeight="bold"
        marginBottom={theme.spacing(4)}
      >
        {symbol}
      </CurrencyTitle>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '550px',
          transition: '0.3s ease',
          transform: hovered ? 'translateX(0)' : 'translateX(-57%)',
        }}
      >
        <Box sx={{ marginRight: '30px' }}>
          <Caption textAlign="left">
            <FormattedMessage defaultMessage={'STUFF'} />
          </Caption>
          <H4
            textAlign="left"
            fontWeight="bold"
            marginBottom={theme.spacing(4)}
          >
            OTHER SHIT
          </H4>
        </Box>
        <Box>
          <Caption textAlign="left">
            <FormattedMessage defaultMessage={'AS HIGH AS'} />
          </Caption>
          <H4
            textAlign="left"
            fontWeight="bold"
            marginBottom={theme.spacing(4)}
          >
            {isVariable ? (
              <FormattedMessage
                defaultMessage="{formattedRate} Variable APY"
                values={{
                  formattedRate: formattedRate,
                }}
              />
            ) : (
              <FormattedMessage
                defaultMessage="{formattedRate} Fixed APY"
                values={{
                  formattedRate: formattedRate,
                }}
              />
            )}
          </H4>
        </Box>
      </Box>
    </Box>
  );
}
