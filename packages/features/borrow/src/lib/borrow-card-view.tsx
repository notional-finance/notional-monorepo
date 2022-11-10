import { LEND_BORROW } from '@notional-finance/shared-config';
import { CardContainer, CardVariant } from '@notional-finance/mui';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { defineMessage } from 'react-intl';

export const BorrowCardView = () => {
  const { currencyMarkets } = useAllMarkets();
  const orderedCurrencyIds = Array.from(currencyMarkets.keys()).sort();
  const rates = orderedCurrencyIds.map((i) => {
    try {
      const { orderedMarkets } = currencyMarkets.get(i)!;

      // Returns the minimum rate from the set of markets
      return orderedMarkets.reduce((minRate: number, m) => {
        const rate = m.marketAnnualizedRate();
        if (minRate === 0) return rate;

        return rate < minRate ? rate : minRate;
      }, 0);
    } catch {
      return 0;
    }
  });

  const cards = orderedCurrencyIds.map((cid, i) => {
    const { underlyingSymbol, symbol } = currencyMarkets.get(cid)!;
    const s = underlyingSymbol || symbol;
    const rate = rates.length > i ? rates[i] : 0;
    // Special handling for borrowing ETH, default to collateralized by USDC
    const route =
      s === 'ETH'
        ? `/${LEND_BORROW.BORROW}/${s}/USDC`
        : `/${LEND_BORROW.BORROW}/${s}/ETH`;
    const buttonText = `Borrow ${s}`;

    return (
      <CardVariant
        variant={'currency'}
        symbol={s}
        rate={rate}
        route={route}
        buttonText={buttonText}
      />
    );
  });

  return (
    <CardContainer
      heading={defineMessage({
        defaultMessage: 'Borrow Crypto at Fixed Rates',
        description: 'page heading',
      })}
      subtitle={defineMessage({
        defaultMessage:
          'Borrow against your crypto with certainty for up to one year. Lock in what you pay until maturity or exit early without penalty at the market rate.',
        description: 'page heading subtitle',
      })}
      cards={cards}
    />
  );
};

export default BorrowCardView;
