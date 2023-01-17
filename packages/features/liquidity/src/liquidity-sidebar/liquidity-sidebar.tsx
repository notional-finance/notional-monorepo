import { useEffect } from 'react';
import {
  TransactionConfirmation,
  TradeActionButton,
  TokenApprovalView,
  WalletDepositInput,
  TradePropertiesGrid,
} from '@notional-finance/trade';
import { PageLoading, ActionSidebar } from '@notional-finance/mui';
import { useCurrency } from '@notional-finance/notionable-hooks';
import { useHistory, useLocation } from 'react-router-dom';
import { defineMessage, FormattedMessage } from 'react-intl';
import { useLiquidity } from '../store/use-liquidity';
import { updateLiquidityState } from '../store/liquidity-store';
import { useLiquidityTransaction } from '../store/use-liquidity-transaction';

export const LiquiditySidebar = () => {
  const { selectedToken, tradeProperties, canSubmit } = useLiquidity();
  const { tradableCurrencySymbols: availableCurrencies } = useCurrency();
  const { pathname, search } = useLocation();
  const history = useHistory();
  const txnData = useLiquidityTransaction();

  useEffect(() => {
    if (search.includes('confirm=true')) {
      history.push(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return txnData ? (
    <TransactionConfirmation
      heading={
        <FormattedMessage
          defaultMessage={'Provide Liquidity'}
          description="section heading"
        />
      }
      onCancel={() => history.push(pathname)}
      transactionProperties={txnData.transactionProperties}
      buildTransactionCall={txnData.buildTransactionCall}
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
      {availableCurrencies.length && selectedToken ? (
        <WalletDepositInput
          availableTokens={availableCurrencies}
          selectedToken={selectedToken}
          onChange={({
            selectedToken: newSelectedToken,
            inputAmount,
            hasError,
          }) => {
            // Will update the route and the parent component will update the store
            if (newSelectedToken !== selectedToken)
              history.push(`/provide/${newSelectedToken}`);
            updateLiquidityState({ inputAmount, hasError });
          }}
          inputLabel={defineMessage({
            defaultMessage: '1. How much liquidity do you want to provide?',
            description: 'input label',
          })}
        />
      ) : (
        <PageLoading />
      )}
      <TradePropertiesGrid showBackground data={tradeProperties} />
      <TokenApprovalView />
    </ActionSidebar>
  );
};

export default LiquiditySidebar;
