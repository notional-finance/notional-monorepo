import { useContext, useEffect } from 'react';
import {
  TransactionConfirmation,
  TradeActionButton,
  TokenApprovalView,
  WalletDepositInput,
} from '@notional-finance/trade';
import {
  PageLoading,
  ActionSidebar,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import { useHistory, useLocation } from 'react-router-dom';
import { defineMessage, FormattedMessage } from 'react-intl';
import { LiquidityContext } from '../liquidity-action';

export const LiquiditySidebar = () => {
  const {
    state: {
      availableDepositTokens,
      selectedDepositToken,
      canSubmit,
      buildTransactionCall,
      confirm,
    },
    updateState,
  } = useContext(LiquidityContext);
  const { pathname, search } = useLocation();
  const history = useHistory();
  const { currencyInputRef } = useCurrencyInputRef();

  useEffect(() => {
    if (search.includes('confirm=true')) {
      // TODO: Clears the confirmation on load...
      history.push(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return confirm && buildTransactionCall ? (
    <TransactionConfirmation
      heading={
        <FormattedMessage
          defaultMessage={'Provide Liquidity'}
          description="section heading"
        />
      }
      onCancel={() => history.push(pathname)}
      transactionProperties={{}}
      buildTransactionCall={buildTransactionCall}
    />
  ) : (
    <ActionSidebar
      heading={defineMessage({
        defaultMessage: 'Provide Liquidity',
        description: 'section heading',
      })}
      helptext={defineMessage({
        defaultMessage:
          'You will receive nTokens in return for providing liquidity to all markets at once. nTokens earn yield from cToken supply rates, trading fees, and fCash interest. nToken holders also earn NOTE incentives.',
        description: 'helptext',
      })}
      hideTextOnMobile
      CustomActionButton={TradeActionButton}
      canSubmit={canSubmit}
    >
      {availableDepositTokens && selectedDepositToken ? (
        <WalletDepositInput
          ref={currencyInputRef}
          inputRef={currencyInputRef}
          availableTokens={availableDepositTokens.map((t) => t.symbol)}
          selectedToken={selectedDepositToken}
          onChange={({
            selectedToken: newSelectedToken,
            inputAmount,
            hasError,
          }) => {
            // Will update the route and the parent component will update the store
            if (newSelectedToken !== selectedDepositToken)
              history.push(`/provide/${newSelectedToken}`);

            updateState({
              depositBalance: !hasError ? inputAmount : undefined,
            });
          }}
          inputLabel={defineMessage({
            defaultMessage: '1. How much liquidity do you want to provide?',
            description: 'input label',
          })}
        />
      ) : (
        <PageLoading />
      )}
      {/* <TradePropertiesGrid showBackground data={tradeProperties || {}} /> */}
      <TokenApprovalView />
    </ActionSidebar>
  );
};

export default LiquiditySidebar;
