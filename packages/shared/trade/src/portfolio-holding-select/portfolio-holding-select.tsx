import { AssetSelectDropdown } from '@notional-finance/mui';
import { useContext, useCallback, useEffect } from 'react';
import { MessageDescriptor } from 'react-intl';
import {
  BaseContext,
  useAccountDefinition,
} from '@notional-finance/notionable-hooks';
import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { useParams } from 'react-router';

interface PortfolioHoldingSelectProps {
  context: BaseContext;
  inputLabel: MessageDescriptor;
  isWithdraw?: boolean;
  filterBalances: (
    b: TokenBalance,
    index: number,
    arr: TokenBalance[]
  ) => boolean;
  errorMsg?: MessageDescriptor;
  tightMarginTop?: boolean;
}

export const PortfolioHoldingSelect = ({
  context,
  inputLabel,
  tightMarginTop,
  filterBalances,
  isWithdraw,
}: PortfolioHoldingSelectProps) => {
  const {
    updateState,
    state: { collateral, debt },
  } = useContext(context);
  const { account } = useAccountDefinition();
  const selectedToken = isWithdraw ? debt : collateral;
  const { selectedToken: selectedParamToken } = useParams<{
    selectedToken: string;
  }>();

  const options = account?.balances.filter(filterBalances)?.map((b) => {
    return {
      token: b.token,
      // TODO: this should show the max withdraw amount
      largeFigure: b.toUnderlying().toFloat(),
      largeFigureSuffix: b.underlying.symbol,
      caption: b.toFiat('USD').toDisplayString(),
    };
  });

  const onSelect = useCallback(
    (id: string | null) => {
      const c = options?.find((t) => t.token.id === id);
      updateState(isWithdraw ? { debt: c?.token } : { collateral: c?.token });
    },
    [updateState, options, isWithdraw]
  );

  useEffect(() => {
    if (!options || options.length === 0 || !!selectedToken) return;
    let selected: TokenDefinition | undefined;
    if (selectedParamToken) {
      selected = options.find(
        (t) => t.token.id === selectedParamToken
      )?.token;
    } else {
      selected = options[0].token;
    }
    updateState(isWithdraw ? { debt: selected } : { collateral: selected });
  }, [options, selectedToken, updateState, isWithdraw, selectedParamToken]);

  return (
    <AssetSelectDropdown
      tightMarginTop={tightMarginTop}
      selectedTokenId={selectedToken?.id}
      inputLabel={inputLabel}
      onSelect={onSelect}
      options={options}
    />
  );
};
