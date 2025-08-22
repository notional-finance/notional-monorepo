import { Contract, constants, ethers } from 'ethers';
import {
  useAccountDefinition,
  useSubmitTxn,
} from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';
import { useCallback } from 'react';
import { ERC20, ERC20ABI } from '@notional-finance/contracts';

export const useTokenApproval = (
  symbol: string,
  spender: string | undefined,
  network: Network | undefined
) => {
  const account = useAccountDefinition(network);
  const currentTokenStatus = account?.allowances?.find(
    (t) => t.amount.symbol === symbol && t.spender === spender
  );
  const submitTxn = useSubmitTxn();

  const enableToken = useCallback(
    async (approve: boolean) => {
      try {
        if (currentTokenStatus && network && spender) {
          const erc20 = new Contract(
            ethers.utils.getAddress(currentTokenStatus.amount.token.address),
            ERC20ABI
          ) as ERC20;

          const allowance = approve ? constants.MaxUint256 : constants.Zero;
          submitTxn(
            'ApproveToken',
            await erc20.populateTransaction.approve(spender, allowance)
          );
        }
      } catch (error) {
        console.error(error);
      }
    },
    [currentTokenStatus, network, submitTxn, symbol, spender]
  );

  return {
    tokenStatus: currentTokenStatus,
    enableToken,
  };
};
