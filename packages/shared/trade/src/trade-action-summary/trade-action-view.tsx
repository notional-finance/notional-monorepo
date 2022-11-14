import {
  useCurrencyData,
  useSelectedMarket,
} from '@notional-finance/notionable-hooks';
import { getDateString } from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';
import { Box } from '@mui/material';
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
        marginTop: '2.5rem',
        marginBottom: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
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
      />

      <BoxDisplay
        title={interestTitle}
        value={interestAmount ? Math.abs(interestAmount) : 0}
        symbol={underlyingSymbol || ''}
      />
    </Box>
  );
};
