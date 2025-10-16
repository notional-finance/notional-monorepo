import { ethers, BigNumber } from 'ethers';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { RiskyPosition, VaultType } from '../types';
import { VaultRegistry } from './vaultRegistry';
import { WITHDRAW_REQUEST_MANAGER_ABI } from '../abis';

export async function getWithdrawRequestData(
  positions: RiskyPosition[],
  provider: ethers.providers.Provider,
  vaultRegistry: VaultRegistry
): Promise<{ isWithdrawRequestPending: boolean; canWithdrawRequestFinalize: boolean; primaryWithdrawTokenAmount?: BigNumber; secondaryWithdrawTokenAmount?: BigNumber }[]> {
  const calls: AggregateCall[] = [];
  const wrmInterface = new ethers.utils.Interface(WITHDRAW_REQUEST_MANAGER_ABI);
  
  // Build calls for getting withdraw requests
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];
    const vaultConfig = vaultRegistry.getVaultConfig(position.vault);
    
    if (!vaultConfig) {
      throw new Error(`Vault config not found for vault: ${position.vault}`);
    }
    
    // Add primary WRM call
    calls.push({
      target: new ethers.Contract(vaultConfig.primaryWrm, wrmInterface, provider),
      stage: 0,
      method: 'getWithdrawRequest',
      args: [position.vault, position.account],
      key: `primary_${i}`
    });
    
    // Add secondary WRM call for CurveConvex2Token
    if (vaultConfig.vaultType === VaultType.CurveConvex2Token && vaultConfig.secondaryWrm) {
      calls.push({
        target: new ethers.Contract(vaultConfig.secondaryWrm, wrmInterface, provider),
        stage: 0,
        method: 'getWithdrawRequest',
        args: [position.vault, position.account],
        key: `secondary_${i}`
      });
    }
  }
  
  // Execute first batch to get withdraw request data
  const { results } = await aggregate(calls, provider);
  
  // Build calls for canFinalizeWithdrawRequest
  const finalizeCalls: AggregateCall[] = [];
  
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];
    const vaultConfig = vaultRegistry.getVaultConfig(position.vault)!;
    
    const primaryResult = results[`primary_${i}`] as [any, any];
    const primaryRequestId = primaryResult[0].requestId;
    
    if (!primaryRequestId.isZero()) {
      finalizeCalls.push({
        target: new ethers.Contract(vaultConfig.primaryWrm, wrmInterface, provider),
        stage: 1,
        method: 'canFinalizeWithdrawRequest',
        args: [primaryRequestId],
        key: `primary_finalize_${i}`
      });
    }
    
    // Handle secondary for CurveConvex2Token
    if (vaultConfig.vaultType === VaultType.CurveConvex2Token && vaultConfig.secondaryWrm) {
      const secondaryResult = results[`secondary_${i}`] as [any, any];
      const secondaryRequestId = secondaryResult[0].requestId;
      
      if (!secondaryRequestId.isZero()) {
        finalizeCalls.push({
          target: new ethers.Contract(vaultConfig.secondaryWrm, wrmInterface, provider),
          stage: 1,
          method: 'canFinalizeWithdrawRequest',
          args: [secondaryRequestId],
          key: `secondary_finalize_${i}`
        });
      }
    }
  }
  
  // Execute finalize calls if any
  const finalizeResults = finalizeCalls.length > 0 ? 
    await aggregate([...calls, ...finalizeCalls], provider) :
    { results };
  
  // Process results and calculate withdraw token amounts
  const processedResults: { isWithdrawRequestPending: boolean; canWithdrawRequestFinalize: boolean; primaryWithdrawTokenAmount?: BigNumber; secondaryWithdrawTokenAmount?: BigNumber }[] = [];
  
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];
    const vaultConfig = vaultRegistry.getVaultConfig(position.vault)!;
    
    const primaryResult = finalizeResults.results[`primary_${i}`] as [any, any];
    const primaryRequestId = primaryResult[0].requestId;
    const primaryWithdrawRequest = primaryResult[0];
    const primaryTokenizedWithdrawRequest = primaryResult[1];
    
    if (vaultConfig.vaultType === VaultType.CurveConvex2Token && vaultConfig.secondaryWrm) {
      const secondaryResult = finalizeResults.results[`secondary_${i}`] as [any, any];
      const secondaryRequestId = secondaryResult[0].requestId;
      const secondaryWithdrawRequest = secondaryResult[0];
      const secondaryTokenizedWithdrawRequest = secondaryResult[1];
      
      // For CurveConvex2Token: pending if either request ID is non-zero
      const isWithdrawRequestPending = !primaryRequestId.isZero() || !secondaryRequestId.isZero();
      
      // Calculate withdraw token amounts
      let primaryWithdrawTokenAmount: BigNumber | undefined;
      let secondaryWithdrawTokenAmount: BigNumber | undefined;
      
      if (isWithdrawRequestPending) {
        if (!primaryRequestId.isZero()) {
          // primaryWithdrawTokenAmount = tokenizedWithdrawRequest.totalWithdraw * withdrawRequest.yieldTokenAmount / tokenizedWithdrawRequest.totalYieldTokenAmount
          primaryWithdrawTokenAmount = primaryTokenizedWithdrawRequest.totalWithdraw
            .mul(primaryWithdrawRequest.yieldTokenAmount)
            .div(primaryTokenizedWithdrawRequest.totalYieldTokenAmount);
        }
        
        if (!secondaryRequestId.isZero()) {
          secondaryWithdrawTokenAmount = secondaryTokenizedWithdrawRequest.totalWithdraw
            .mul(secondaryWithdrawRequest.yieldTokenAmount)
            .div(secondaryTokenizedWithdrawRequest.totalYieldTokenAmount);
        }
      }
      
      let canWithdrawRequestFinalize = false;
      if (isWithdrawRequestPending) {
        let canFinalizePrimary = true;
        let canFinalizeSecondary = true;
        
        if (!primaryRequestId.isZero()) {
          canFinalizePrimary = finalizeResults.results[`primary_finalize_${i}`] as boolean;
        }
        if (!secondaryRequestId.isZero()) {
          canFinalizeSecondary = finalizeResults.results[`secondary_finalize_${i}`] as boolean;
        }
        
        canWithdrawRequestFinalize = canFinalizePrimary && canFinalizeSecondary;
      }
      
      processedResults.push({
        isWithdrawRequestPending,
        canWithdrawRequestFinalize,
        primaryWithdrawTokenAmount,
        secondaryWithdrawTokenAmount
      });
    } else {
      // For Staking and PendlePT: only primary request
      const isWithdrawRequestPending = !primaryRequestId.isZero();
      
      // Calculate withdraw token amount for primary request
      let primaryWithdrawTokenAmount: BigNumber | undefined;
      
      if (isWithdrawRequestPending) {
        primaryWithdrawTokenAmount = primaryTokenizedWithdrawRequest.totalWithdraw
          .mul(primaryWithdrawRequest.yieldTokenAmount)
          .div(primaryTokenizedWithdrawRequest.totalYieldTokenAmount);
      }
      
      const canWithdrawRequestFinalize = isWithdrawRequestPending ? 
        (finalizeResults.results[`primary_finalize_${i}`] as boolean || false) : false;
      
      processedResults.push({
        isWithdrawRequestPending,
        canWithdrawRequestFinalize,
        primaryWithdrawTokenAmount,
        secondaryWithdrawTokenAmount: undefined
      });
    }
  }
  
  return processedResults;
}