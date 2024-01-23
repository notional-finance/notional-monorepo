import { Maturities } from './components/maturities';
import { MessageDescriptor } from 'react-intl';
import { useMaturitySelect } from './use-maturity-select';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import { useEffect } from 'react';

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
  const { maturityData, selectedfCashId, onSelect, defaultfCashId } =
    useMaturitySelect(category, context);

  // FIXME: this has an initialization issue where it gets cleared...
  useEffect(() => {
    if (!selectedfCashId) {
      onSelect(defaultfCashId);
    }
  }, [selectedfCashId, onSelect, defaultfCashId]);

  return (
    <Maturities
      maturityData={maturityData}
      selectedfCashId={selectedfCashId}
      defaultfCashId={defaultfCashId || ''}
      onSelect={onSelect}
      inputLabel={inputLabel}
    />
  );
}
