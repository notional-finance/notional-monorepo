import { tokenApprovalState$, updateTokenStatus } from './token-approval.store';
import { constants } from 'ethers';
import { useAccount, useNotional } from '@notional-finance/notionable-hooks';
import { EnableTokenProps } from '@notional-finance/notionable';
import { useObservableState } from 'observable-hooks';

export const useTokenApproval = (symbol: string) => {
  const tokenApprovalState = useObservableState(tokenApprovalState$);
  const { system } = useNotional();
  const { account } = useAccount();
  const currentTokenStatus = tokenApprovalState ? tokenApprovalState[symbol] : null;

  const enableToken = async ({ symbol, approved }: EnableTokenProps) => {
    if (!system) {
      updateTokenStatus({ [symbol]: 'ERROR' });
      return;
    }

    if (account) {
      const allowance = approved ? constants.MaxUint256 : constants.Zero;
      let spender;
      // Make spender explicit here
      if (symbol === 'WETH' || symbol === 'NOTE') {
        spender = system.getStakedNote().address;
      } else {
        spender = system.getNotionalProxy().address;
      }

      try {
        updateTokenStatus({ [symbol]: 'PENDING' });
        const populatedTxn = await account!.setAllowance(symbol, allowance, spender);
        const resp = await account!.sendTransaction(populatedTxn);
        await resp.wait();
        updateTokenStatus({ [symbol]: 'SUCCESS' });
      } catch (error) {
        updateTokenStatus({ [symbol]: 'ERROR' });
      }
    }
  };

  return {
    tokenStatus: currentTokenStatus,
    enableToken,
  };
};
