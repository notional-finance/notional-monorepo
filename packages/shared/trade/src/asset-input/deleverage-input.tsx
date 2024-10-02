import { CurrencyInputHandle } from '@notional-finance/mui';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import React from 'react';
import { MessageDescriptor } from 'react-intl';
import { AssetInput } from './asset-input';
import { useDeleverage } from './use-deleverage';

interface DeleverageInputProps {
  context: BaseTradeContext;
  prefillMax?: boolean;
  isPrimaryInput: boolean;
  onMaxValue: () => void;
  setPrimaryInput: (input: 'Debt' | 'Collateral') => void;
  debtOrCollateral: 'Debt' | 'Collateral';
  newRoute?: (newToken: string | null) => string;
  warningMsg?: React.ReactNode;
  label?: React.ReactNode;
  errorMsgOverride?: MessageDescriptor;
  inputRef: React.RefObject<CurrencyInputHandle>;
}

const DeleverageInput = React.forwardRef<
  CurrencyInputHandle,
  DeleverageInputProps
>(
  (
    {
      context,
      debtOrCollateral,
      isPrimaryInput,
      setPrimaryInput,
      onMaxValue,
      label,
      inputRef,
      warningMsg,
      errorMsgOverride,
    },
    ref
  ) => {
    const { options, updateBalances, updateDeleverageToken } = useDeleverage(
      context,
      isPrimaryInput,
      inputRef,
      debtOrCollateral
    );

    return (
      <AssetInput
        ref={ref}
        context={context}
        debtOrCollateral={debtOrCollateral}
        onBalanceChange={updateBalances}
        label={label}
        inputRef={inputRef}
        warningMsg={warningMsg}
        errorMsgOverride={errorMsgOverride}
        options={options}
        onMaxValue={onMaxValue}
        afterInputChange={() => setPrimaryInput(debtOrCollateral)}
        afterTokenChange={updateDeleverageToken}
      />
    );
  }
);

DeleverageInput.displayName = 'DeleverageInput';
export { DeleverageInput };
