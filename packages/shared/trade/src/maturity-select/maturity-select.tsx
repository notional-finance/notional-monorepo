import { Maturities } from './components/maturities';
import { MessageDescriptor } from 'react-intl';
import { useMaturitySelect } from './use-maturity-select';
import { observer } from 'mobx-react-lite';

interface MaturitySelectProps {
  category: 'Collateral' | 'Debt';
  inputLabel?: MessageDescriptor;
}

export const MaturitySelect = observer(
  ({ category, inputLabel }: MaturitySelectProps) => {
    const { maturityData, selectedfCashId, onSelect, defaultfCashId } =
      useMaturitySelect(category);

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
);
