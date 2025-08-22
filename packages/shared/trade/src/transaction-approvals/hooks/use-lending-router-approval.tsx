import {
  useCurrentNetworkStore,
  useAccountDefinition,
  useSelectedNetwork,
  useSubmitTxn,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import { MorphoRouter } from '@notional-finance/util';
import { Contract } from 'ethers';
import { useCallback } from 'react';

const MorphoABI = ['function setAuthorization(address,bool)'];

export const useLendingRouterApproval = (lendingRouter: string | undefined) => {
  const network = useSelectedNetwork();
  const account = useAccountDefinition(network);
  const model = useCurrentNetworkStore();
  const isApproved =
    account && lendingRouter
      ? account.lendingRouterApprovals[lendingRouter]
      : false;
  const routerName = lendingRouter
    ? model.getLendingRouter(lendingRouter)?.name
    : undefined;
  const submitTxn = useSubmitTxn();

  const approveRouter = useCallback(
    async (approve: boolean) => {
      try {
        if (routerName === 'Morpho') {
          const morpho = new Contract(MorphoRouter[network], MorphoABI);
          submitTxn(
            'ApproveMorpho',
            await morpho.populateTransaction.setAuthorization(
              lendingRouter,
              approve
            )
          );
        }
      } catch (error) {
        console.error(error);
      }
    },
    [lendingRouter, account, model, routerName]
  );

  return {
    routerApprovalRequired: !isApproved,
    approveRouter,
  };
};
