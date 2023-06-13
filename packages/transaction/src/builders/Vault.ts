import { PopulatedTransaction } from 'ethers';
import { PopulateTransactionInputs } from './common';

export function EnterVault({
  address,
  network,
  depositBalance,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  throw Error('Unimplemented');
}

export function ExitVault({
  address,
  network,
  depositBalance,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  throw Error('Unimplemented');
}

export function RollVault({
  address,
  network,
  depositBalance,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  throw Error('Unimplemented');
}
