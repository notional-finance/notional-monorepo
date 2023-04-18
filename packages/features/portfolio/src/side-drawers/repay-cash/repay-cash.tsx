import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { useQueryParams } from '@notional-finance/utils';
import { TokenApprovalView, WalletDepositInput } from '@notional-finance/trade';
import { useRepayCash } from './use-repay-cash';
import { useParams } from 'react-router';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { messages } from '../messages';
import { useEffect, useRef } from 'react';
import { CurrencyInputHandle } from '@notional-finance/mui';

export const RepayCash = () => {
  const { sideDrawerKey } = useParams<PortfolioParams>();
  const { symbol, assetKey } = useQueryParams();
  const inputRef = useRef<CurrencyInputHandle>(null);
  const {
    selectedToken,
    availableTokens,
    canSubmit,
    updatedAccountData,
    transactionData,
    defaultRepaymentAmount,
    updateRepayCashState,
  } = useRepayCash(symbol, assetKey);

  useEffect(() => {
    if (defaultRepaymentAmount)
      inputRef.current?.setInputOverride(defaultRepaymentAmount);
  }, [defaultRepaymentAmount, inputRef]);

  return selectedToken && sideDrawerKey ? (
    <PortfolioSideDrawer
      action={sideDrawerKey}
      canSubmit={canSubmit}
      updatedAccountData={updatedAccountData}
      transactionData={transactionData}
    >
      <WalletDepositInput
        ref={inputRef}
        inputRef={inputRef}
        availableTokens={availableTokens}
        selectedToken={selectedToken}
        onChange={({ selectedToken, inputAmount, hasError }) => {
          updateRepayCashState({ selectedToken, inputAmount, hasError });
        }}
        maxValueOverride={defaultRepaymentAmount}
        inputLabel={messages[sideDrawerKey]['inputLabel']}
      />
      <TokenApprovalView symbol={selectedToken} />
    </PortfolioSideDrawer>
  ) : null;
};
