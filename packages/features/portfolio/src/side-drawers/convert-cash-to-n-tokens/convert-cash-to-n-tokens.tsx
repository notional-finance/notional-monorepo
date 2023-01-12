import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { useQueryParams } from '@notional-finance/utils';
import {
  LEND_BORROW,
  PORTFOLIO_ACTIONS,
} from '@notional-finance/shared-config';
import { useConvertCashToNTokens } from './use-convert-cash-to-n-tokens';
import { FormattedMessage } from 'react-intl';
import { messages } from '../messages';

export const ConvertCashToNTokens = () => {
  const { symbol } = useQueryParams();
  console.log({ symbol });
  // const {} = useConvertCashToNTokens(symbol);

  return (
    <div>CONVERT {symbol} TO N TOKENS</div>
    // <PortfolioSideDrawer
    //   action={PORTFOLIO_ACTIONS.CONVERT_CASH}
    //   canSubmit={canSubmit}
    //   updatedAccountData={updatedAccountData}
    //   transactionData={transactionData}
    //   showRiskTable={false}
    // >
    //   {selectedToken && availableTokens.length > 0 && (
    //     <LendBorrowInput
    //       availableTokens={availableTokens}
    //       selectedToken={selectedToken}
    //       cashOrfCash={cashOrfCash}
    //       lendOrBorrow={LEND_BORROW.BORROW}
    //       isRemoveAsset={true}
    //       selectedMarketKey={selectedMarketKey}
    //       onChange={({
    //         inputAmount,
    //         hasError,
    //         netCashAmount,
    //         netfCashAmount,
    //       }) => {
    //         updateWithdrawLendState({
    //           inputAmount,
    //           hasError,
    //           netCashAmount,
    //           netfCashAmount,
    //         });
    //       }}
    //       inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW_LEND]['inputLabel']}
    //     />
    //   )}
    // </PortfolioSideDrawer>
  );
};
