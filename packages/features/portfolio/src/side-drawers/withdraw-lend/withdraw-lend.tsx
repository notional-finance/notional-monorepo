import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { useQueryParams } from '@notional-finance/utils';
import {
  LEND_BORROW,
  PORTFOLIO_ACTIONS,
} from '@notional-finance/shared-config';
import { LendBorrowInput, TradePropertiesGrid } from '@notional-finance/trade';
import { useWithdrawLend } from './use-withdraw-lend';
import { FormattedMessage } from 'react-intl';
import { messages } from '../messages';

export const WithdrawLend = () => {
  const { assetKey } = useQueryParams();
  const {
    availableTokens,
    selectedToken,
    selectedMarketKey,
    canSubmit,
    updatedAccountData,
    transactionData,
    sideDrawerInfo,
    cashOrfCash,
    withdrawToPortfolio,
    updateWithdrawLendState,
  } = useWithdrawLend(assetKey);

  return (
    <PortfolioSideDrawer
      action={PORTFOLIO_ACTIONS.WITHDRAW_LEND}
      canSubmit={canSubmit}
      updatedAccountData={updatedAccountData}
      transactionData={transactionData}
      advancedToggle={{
        label: (
          <FormattedMessage
            {...messages[PORTFOLIO_ACTIONS.WITHDRAW_LEND][
              'withdrawToPortfolio'
            ]}
          />
        ),
        onToggle: (isChecked) => {
          updateWithdrawLendState({ withdrawToPortfolio: isChecked });
        },
        isChecked: withdrawToPortfolio,
      }}
    >
      {selectedToken && availableTokens.length > 0 && (
        <LendBorrowInput
          availableTokens={availableTokens}
          selectedToken={selectedToken}
          cashOrfCash={cashOrfCash}
          lendOrBorrow={LEND_BORROW.BORROW}
          isRemoveAsset={true}
          selectedMarketKey={selectedMarketKey}
          onChange={({
            inputAmount,
            hasError,
            netCashAmount,
            netfCashAmount,
          }) => {
            updateWithdrawLendState({
              inputAmount,
              hasError,
              netCashAmount,
              netfCashAmount,
            });
          }}
          inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW_LEND]['inputLabel']}
        />
      )}
      <TradePropertiesGrid showBackground data={sideDrawerInfo} />
    </PortfolioSideDrawer>
  );
};
