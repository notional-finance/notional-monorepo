import { ethers, BigNumber } from 'ethers';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { RiskyPosition, VaultType } from '../types';
import { VaultRegistry } from './vaultRegistry';
import { WITHDRAW_REQUEST_MANAGER_ABI } from '../abis';

export async function getWithdrawRequestData(
  positions: RiskyPosition[],
  provider: ethers.providers.Provider,
  vaultRegistry: VaultRegistry
): Promise<
  {
    isWithdrawRequestPending: boolean;
    canWithdrawRequestFinalize: boolean;
    primaryWithdrawTokenAmount?: BigNumber;
    secondaryWithdrawTokenAmount?: BigNumber;
  }[]
> {
  const wrmInterface = new ethers.utils.Interface(WITHDRAW_REQUEST_MANAGER_ABI);

  // Build calls for getting withdraw requests
  const calls: AggregateCall[] = positions.flatMap((position, i) => {
    const vaultConfig = vaultRegistry.getVaultConfig(position.vault);

    if (!vaultConfig) {
      throw new Error(`Vault config not found for vault: ${position.vault}`);
    }

    const primaryCall = {
      target: new ethers.Contract(
        vaultConfig.primaryWrm,
        wrmInterface,
        provider
      ),
      stage: 0,
      method: 'getWithdrawRequest',
      args: [position.vault, position.account],
      key: `primary_${i}`,
    };

    // Add secondary WRM call for CurveConvex2Token
    if (
      vaultConfig.vaultType === VaultType.CurveConvex2Token &&
      vaultConfig.secondaryWrm
    ) {
      return [
        primaryCall,
        {
          target: new ethers.Contract(
            vaultConfig.secondaryWrm,
            wrmInterface,
            provider
          ),
          stage: 0,
          method: 'getWithdrawRequest',
          args: [position.vault, position.account],
          key: `secondary_${i}`,
        },
      ];
    }

    return [primaryCall];
  });

  // Execute first batch to get withdraw request data
  console.log('🏗️  Withdraw request calls:', calls.length);
  const { results } = await aggregate(calls, provider);
  console.log('🏗️  Withdraw request results:', results);

  // Build calls for canFinalizeWithdrawRequest
  const finalizeCalls: AggregateCall[] = positions.flatMap((position, i) => {
    const vaultConfig = vaultRegistry.getVaultConfig(position.vault)!;

    const primaryResult = results[`primary_${i}`] as [any, any];
    const primaryRequestId = primaryResult[0].requestId;

    const calls: AggregateCall[] = [];

    if (!primaryRequestId.isZero()) {
      calls.push({
        target: new ethers.Contract(
          vaultConfig.primaryWrm,
          wrmInterface,
          provider
        ),
        stage: 0,
        method: 'finalizeRequestManual',
        args: [position.vault, position.account],
        key: `primary_finalize_${i}`,
      });
    }

    // Handle secondary for CurveConvex2Token
    if (
      vaultConfig.vaultType === VaultType.CurveConvex2Token &&
      vaultConfig.secondaryWrm
    ) {
      const secondaryResult = results[`secondary_${i}`] as [any, any];
      const secondaryRequestId = secondaryResult[0].requestId;

      if (!secondaryRequestId.isZero()) {
        calls.push({
          target: new ethers.Contract(
            vaultConfig.secondaryWrm,
            wrmInterface,
            provider
          ),
          stage: 0,
          method: 'finalizeRequestManual',
          args: [position.vault, position.account],
          key: `secondary_finalize_${i}`,
        });
      }
    }

    return calls;
  });

  // Execute finalize calls if any with allowFailure=true
  console.log('🏗️  Finalize calls:', finalizeCalls);
  const finalizeResults =
    finalizeCalls.length > 0
      ? await aggregate(finalizeCalls, provider, undefined, true) // allowFailure=true
      : { results: {} };
  console.log('🏗️  Finalize results:', finalizeResults);

  // Process results and calculate withdraw token amounts
  return positions.map((position, i) => {
    const vaultConfig = vaultRegistry.getVaultConfig(position.vault)!;

    const primaryResult = results[`primary_${i}`] as [any, any];
    const primaryRequestId = primaryResult[0].requestId;
    const primaryWithdrawRequest = primaryResult[0];
    const primaryTokenizedWithdrawRequest = primaryResult[1];

    if (
      vaultConfig.vaultType === VaultType.CurveConvex2Token &&
      vaultConfig.secondaryWrm
    ) {
      const secondaryResult = results[`secondary_${i}`] as [any, any];
      const secondaryRequestId = secondaryResult[0].requestId;
      const secondaryWithdrawRequest = secondaryResult[0];
      const secondaryTokenizedWithdrawRequest = secondaryResult[1];

      // For CurveConvex2Token: pending if either request ID is non-zero
      const isWithdrawRequestPending =
        !primaryRequestId.isZero() || !secondaryRequestId.isZero();

      // Calculate withdraw token amounts
      const primaryWithdrawTokenAmount =
        isWithdrawRequestPending && !primaryRequestId.isZero()
          ? primaryTokenizedWithdrawRequest.totalWithdraw
              .mul(primaryWithdrawRequest.yieldTokenAmount)
              .div(primaryTokenizedWithdrawRequest.totalYieldTokenAmount)
          : undefined;

      const secondaryWithdrawTokenAmount =
        isWithdrawRequestPending && !secondaryRequestId.isZero()
          ? secondaryTokenizedWithdrawRequest.totalWithdraw
              .mul(secondaryWithdrawRequest.yieldTokenAmount)
              .div(secondaryTokenizedWithdrawRequest.totalYieldTokenAmount)
          : undefined;

      const canWithdrawRequestFinalize = isWithdrawRequestPending
        ? (!primaryRequestId.isZero()
            ? finalizeResults.results[`primary_finalize_${i}`] !== undefined
            : true) &&
          (!secondaryRequestId.isZero()
            ? finalizeResults.results[`secondary_finalize_${i}`] !== undefined
            : true)
        : false;

      return {
        isWithdrawRequestPending,
        canWithdrawRequestFinalize,
        primaryWithdrawTokenAmount,
        secondaryWithdrawTokenAmount,
      };
    } else {
      // For Staking and PendlePT: only primary request
      const isWithdrawRequestPending = !primaryRequestId.isZero();

      const primaryWithdrawTokenAmount = isWithdrawRequestPending
        ? primaryTokenizedWithdrawRequest.totalWithdraw
            .mul(primaryWithdrawRequest.yieldTokenAmount)
            .div(primaryTokenizedWithdrawRequest.totalYieldTokenAmount)
        : undefined;

      const canWithdrawRequestFinalize = isWithdrawRequestPending
        ? finalizeResults.results[`primary_finalize_${i}`] !== undefined
        : false;

      return {
        isWithdrawRequestPending,
        canWithdrawRequestFinalize,
        primaryWithdrawTokenAmount,
        secondaryWithdrawTokenAmount: undefined,
      };
    }
  });
}
