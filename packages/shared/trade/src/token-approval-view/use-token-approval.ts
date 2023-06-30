import { Contract, constants, ethers } from 'ethers';
import {
  useAccountDefinition,
  useSelectedNetwork,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import {
  Network,
  NotionalAddress,
  StakedNoteAddress,
} from '@notional-finance/util';
import { useCallback } from 'react';
import { ERC20, ERC20ABI } from '@notional-finance/contracts';

export const useTokenApproval = (symbol: string) => {
  const selectedNetwork = useSelectedNetwork();
  const { account } = useAccountDefinition();
  const currentTokenStatus = account?.allowances?.find(
    (t) => t.amount.symbol === symbol
  );
  const { isReadOnlyAddress, transactionStatus, onSubmit } =
    useTransactionStatus();

  const enableToken = useCallback(
    async (approve: boolean) => {
      try {
        if (currentTokenStatus && selectedNetwork) {
          const erc20 = new Contract(
            ethers.utils.getAddress(currentTokenStatus.amount.token.address),
            ERC20ABI
          ) as ERC20;

          let spender;
          if (symbol === 'WETH' || symbol === 'NOTE') {
            if (selectedNetwork !== Network.Mainnet)
              throw Error('NOTE staking is only on mainnet');
            spender = StakedNoteAddress;
          } else {
            spender = NotionalAddress[selectedNetwork];
          }

          const allowance = approve ? constants.MaxUint256 : constants.Zero;
          onSubmit(await erc20.populateTransaction.approve(spender, allowance));
        }
      } catch (error) {
        // todo
      }
    },
    [currentTokenStatus, selectedNetwork, onSubmit, symbol]
  );

  return {
    tokenStatus: currentTokenStatus,
    transactionStatus,
    isSignerConnected: account && !isReadOnlyAddress,
    enableToken,
  };
};
