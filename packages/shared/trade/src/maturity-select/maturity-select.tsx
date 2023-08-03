import { Maturities } from '@notional-finance/mui';
import { MessageDescriptor } from 'react-intl';
import { useMaturitySelect } from './use-maturity-select';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';

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
  const { maturityData, selectedfCashId, onSelect } = useMaturitySelect(
    category,
    context
  );

  return (
    <Maturities
      maturityData={maturityData}
      selectedfCashId={selectedfCashId}
      onSelect={onSelect}
      inputLabel={inputLabel}
    />
  );
}
