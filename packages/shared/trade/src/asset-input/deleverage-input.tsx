import { CurrencyInputHandle } from '@notional-finance/mui';
import React from 'react';
import { MessageDescriptor } from 'react-intl';
import { AssetInput } from './asset-input';
import { useDeleverage } from './use-deleverage';

interface DeleverageInputProps {
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

export const DeleverageInput = React.forwardRef<
  CurrencyInputHandle,
  DeleverageInputProps
>(
  (
    {
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
      isPrimaryInput,
      inputRef,
      debtOrCollateral
    );

    return (
      <AssetInput
        ref={ref}
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
