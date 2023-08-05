import { AssetSelectDropdown } from '@notional-finance/mui';
import { useCallback, useEffect, useMemo } from 'react';
import { MessageDescriptor } from 'react-intl';
import {
  BaseTradeContext,
  useAccountDefinition,
  usePortfolioRiskProfile,
} from '@notional-finance/notionable-hooks';
import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { useParams } from 'react-router';

interface PortfolioHoldingSelectProps {
  context: BaseTradeContext;
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
  } = context;
  const { account } = useAccountDefinition();
  const profile = usePortfolioRiskProfile();
  const selectedToken = isWithdraw ? debt : collateral;
  const { selectedToken: selectedParamToken } = useParams<{
    selectedToken: string;
  }>();

  const options = useMemo(() => {
    return account?.balances.filter(filterBalances)?.map((b) => {
      const maxWithdraw = profile.maxWithdraw(b.token);
      return {
        token: b.token,
        largeFigure: maxWithdraw?.toUnderlying().toFloat() || 0,
        largeFigureSuffix: b.underlying.symbol,
        caption: maxWithdraw?.toFiat('USD').toDisplayStringWithSymbol(),
      };
    });
  }, [account, filterBalances, profile]);

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
      selected = options.find((t) => t.token.id === selectedParamToken)?.token;
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
