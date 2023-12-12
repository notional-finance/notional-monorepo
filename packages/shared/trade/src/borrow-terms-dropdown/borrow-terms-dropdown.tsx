// import { useCallback } from 'react';
import { AssetSelectDropdown } from '@notional-finance/mui';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import { useBorrowTerms } from './use-borrow-terms';

interface BorrowTermsDropdownProps {
  context: BaseTradeContext;
}

export const BorrowTermsDropdown = ({ context }: BorrowTermsDropdownProps) => {
  const {
    state: { debt },
  } = context;
  const { borrowOptions, onSelect, defaultDebtOption } =
    useBorrowTerms(context);
  return (
    <div>
      <AssetSelectDropdown
        selectedTokenId={debt?.id || defaultDebtOption?.token.id}
        onSelect={onSelect}
        options={borrowOptions}
      />
    </div>
  );
};

export default BorrowTermsDropdown;
