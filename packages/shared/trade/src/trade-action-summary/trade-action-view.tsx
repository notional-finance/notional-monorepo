import {
  useCurrencyData,
  useSelectedMarket,
} from '@notional-finance/notionable-hooks';
import { getDateString } from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';
import { Box, useTheme } from '@mui/material';
import { BoxDisplay } from '@notional-finance/mui';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';

interface TradeActionViewProps {
  selectedMarketKey: string | null;
  tradeAction: NOTIONAL_CATEGORIES;
  selectedToken: string;
  fCashAmount: number | undefined;
  interestAmount: number | undefined;
}

export const TradeActionView = ({
  selectedMarketKey,
  tradeAction,
  fCashAmount,
  interestAmount,
  selectedToken,
}: TradeActionViewProps) => {
  const theme = useTheme();
  const selectedMarket = useSelectedMarket(selectedMarketKey);
  const { underlyingSymbol } = useCurrencyData(selectedToken);
  const maturityDate = selectedMarket
    ? ` | ${getDateString(selectedMarket.maturity)}`
    : '';

  const totalTitle =
    tradeAction === NOTIONAL_CATEGORIES.LEND ? (
      <FormattedMessage defaultMessage={'Total at Maturity'} />
    ) : (
      <FormattedMessage defaultMessage={'Total Due at Maturity'} />
    );
  const interestTitle =
    tradeAction === NOTIONAL_CATEGORIES.LEND ? (
      <FormattedMessage defaultMessage={'Interest Earned'} />
    ) : (
      <FormattedMessage defaultMessage={'Interest Due'} />
    );

  return (
    <Box
      sx={{
        marginTop: theme.spacing(5),
        marginBottom: theme.spacing(5),
        display: 'flex',
        gridGap: theme.spacing(5),
        width: '100%',
      }}
    >
      <BoxDisplay
        title={
          <>
            {totalTitle}
            {maturityDate}
          </>
        }
        value={fCashAmount ? Math.abs(fCashAmount) : 0}
        symbol={underlyingSymbol || ''}
        overrides={{ margin: '0px' }}
      />

      <BoxDisplay
        title={interestTitle}
        value={interestAmount ? Math.abs(interestAmount) : 0}
        symbol={underlyingSymbol || ''}
        overrides={{ margin: '0px' }}
      />
    </Box>
  );
};
