import { Request, Response } from '@google-cloud/functions-framework';
import { ethers, Contract } from 'ethers';
import { Sign, rpcUrls, rebalanceHelperAddresses } from './config';
import { Network } from './types';
import { sendTransaction } from './Signer';
import { logToDataDog } from './util';

export const RebalanceHelperInterface = new ethers.utils.Interface([
  'function checkRebalance() public view returns (uint16[])',
]);
export async function checkAndTriggerRebalance(network: Network) {
  const log = logToDataDog('rebalance-service');
  const provider = ethers.getDefaultProvider(rpcUrls[network]);
  const rebalanceHelper = new Contract(
    rebalanceHelperAddresses[network],
    RebalanceHelperInterface,
    provider
  );
  const currencyIdsToProcess = await rebalanceHelper.checkRebalance();

  if (currencyIdsToProcess.length === 0) {
    return 'rebalance not needed';
  }

  const result = await sendTransaction(
    {
      to: rebalanceHelperAddresses[network],
      data: Sign.checkAndRebalance,
      network,
    },
    { provider, log }
  );

  const receipt = await result.wait();
  const logData = { network, hash: receipt.transactionHash };
  if (receipt.status !== 1) {
    await log(
      { message: { ...logData, status: 'error' } },
      { tags: 'event:rebalance_error', service: 'rebalance-service' }
    );
    throw new Error('Rebalance transaction failed');
  }

  await log(
    { message: { ...logData, status: 'success' } },
    {
      tags: 'event:rebalance_successful',
      service: 'rebalance-service',
    }
  );
  return 'rebalance transaction successful';
}

export default async function rebalanceService(req: Request, res: Response) {
  const network: Network = req.path.split('/')[1] as Network;
  const result = await checkAndTriggerRebalance(network);
  res.status(200).send(JSON.stringify(result));
}
