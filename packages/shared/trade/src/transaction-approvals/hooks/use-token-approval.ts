import { Contract, constants, ethers } from 'ethers';
import {
  useAccountDefinition,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import { Network, NotionalAddress, sNOTE } from '@notional-finance/util';
import { useCallback } from 'react';
import { ERC20, ERC20ABI } from '@notional-finance/contracts';

export const useTokenApproval = (
  symbol: string,
  network: Network | undefined
) => {
  const account = useAccountDefinition(network);
  const currentTokenStatus = account?.allowances?.find(
    (t) => t.amount.symbol === symbol
  );
  const { isReadOnlyAddress, transactionStatus, onSubmit } =
    useTransactionStatus(network);

  const enableToken = useCallback(
    async (approve: boolean) => {
      try {
        if (currentTokenStatus && network) {
          const erc20 = new Contract(
            ethers.utils.getAddress(currentTokenStatus.amount.token.address),
            ERC20ABI
          ) as ERC20;

          let spender;
          if (symbol === 'WETH' || symbol === 'NOTE') {
            if (network !== Network.mainnet)
              throw Error('NOTE staking is only on mainnet');
            spender = sNOTE;
          } else {
            spender = NotionalAddress[network];
          }

          const allowance = approve ? constants.MaxUint256 : constants.Zero;
          onSubmit(
            'ApproveToken',
            await erc20.populateTransaction.approve(spender, allowance)
          );
        }
      } catch (error) {
        // todo
      }
    },
    [currentTokenStatus, network, onSubmit, symbol]
  );

  return {
    tokenStatus: currentTokenStatus,
    tokenApprovalTxnStatus: transactionStatus,
    isSignerConnected: account && !isReadOnlyAddress,
    enableToken,
  };
};
