import { Maturities } from '@notional-finance/mui';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import { useContext } from 'react';
import { MessageDescriptor } from 'react-intl';

interface MaturitySelectProps {
  context: BaseTradeContext;
  category: 'Collateral' | 'Debt';
  inputLabel?: MessageDescriptor;
}

export function MaturitySelect({
  context,
  category,
  inputLabel,
}: MaturitySelectProps) {
  const {
    state: { availableCollateralTokens, availableDebtTokens, collateral, debt },
    updateState,
  } = useContext(context);

  const maturityData =
    (category === 'Collateral'
      ? availableCollateralTokens
      : availableDebtTokens
    )?.map((t) => ({
      fCashId: t.id,
      tradeRate: undefined,
      maturity: t.maturity || 0,
      hasLiquidity: true,
      tradeRateString: '',
    })) || [];

  const selectedfCashId = (category === 'Collateral' ? collateral : debt)?.id;

  return (
    <Maturities
      maturityData={maturityData}
      selectedfCashId={selectedfCashId}
      onSelect={(selectedId) => {
        if (category === 'Collateral') {
          const selectedCollateralToken = availableCollateralTokens?.find(
            (t) => t.id === selectedId
          )?.symbol;
          updateState({ selectedCollateralToken });
        } else {
          const selectedDebtToken = availableDebtTokens?.find(
            (t) => t.id === selectedId
          )?.symbol;
          updateState({ selectedDebtToken });
        }
      }}
      inputLabel={inputLabel}
    />
  );
}
