import {
  getNowSeconds,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  SECONDS_IN_YEAR,
  VaultAddress,
} from '@notional-finance/util';
import { PendlePT, SingleSidedLP } from '../../vaults';
import { TokenBalance } from '../../token-balance';
import {
  getVaultType,
  whitelistedVaults,
} from '../../config/whitelisted-vaults';
import { getPoolInstance_ } from './ExchangeViews';
import { ChartType } from '../ModelTypes';
import { getSnapshot, Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';
import { TokenViews } from './TokenViews';
import { TimeSeriesViews } from './TimeSeriesViews';
import { TokenDefinition } from '../../Definitions';
import { PendlePTVaultParams } from '../../vaults/PendlePT';
import { SingleSidedLPParams } from '../../vaults/SingleSidedLP';

function getMinDepositRequiredString(
  minAccountBorrowSize: TokenBalance,
  maxDeleverageCollateralRatioBasisPoints: number,
  maxRequiredAccountCollateralRatioBasisPoints: number
) {
  const lowerDeposit = minAccountBorrowSize
    .mulInRatePrecision(maxDeleverageCollateralRatioBasisPoints)
    .toDisplayStringWithSymbol(2);

  const upperDeposit = minAccountBorrowSize
    .mulInRatePrecision(maxRequiredAccountCollateralRatioBasisPoints)
    .toDisplayStringWithSymbol(2);
  return `${lowerDeposit} to ${upperDeposit}`;
}

export const VaultViews = (self: Instance<typeof NetworkModel>) => {
  const { getTokenByID, getVaultDebt } = TokenViews(self);
  const { getTimeSeries } = TimeSeriesViews(self);

  const isVaultEnabled = (vaultAddress: string) => {
    return self.vaults.get(vaultAddress)?.enabled || false;
  };

  const getVaultAdapter = (vaultAddress: string) => {
    const params = self.vaults.get(vaultAddress);
    if (!params) throw Error(`No vault params found: ${vaultAddress}`);
    const v = self.configuration?.vaultConfigurations.find(
      (c) => c.id === vaultAddress
    );
    if (!v) throw Error(`Configuration not found for ${vaultAddress}`);
    const primaryToken = getTokenByID(v.primaryBorrowCurrency.id);
    if (!primaryToken.currencyId)
      throw Error(`Token not found for ${vaultAddress}`);
    const vaultType = getVaultType(vaultAddress, self.network);

    switch (vaultType) {
      case 'SingleSidedLP_AutoReinvest':
      case 'SingleSidedLP_DirectClaim':
      case 'SingleSidedLP_Points':
        return new SingleSidedLP(
          self.network,
          vaultAddress,
          params as SingleSidedLPParams,
          getPoolInstance_(self, (params as SingleSidedLPParams).pool),
          primaryToken,
          getTimeSeries(v.vaultAddress, ChartType.APY)?.data
        );
      case 'PendlePT':
        return new PendlePT(
          self.network,
          vaultAddress,
          params as PendlePTVaultParams,
          primaryToken
        );
      default:
        throw Error(`Unknown vault type: ${vaultType}`);
    }
  };

  const getVaultName = (vaultAddress: string) => {
    const vault = self.vaults.get(vaultAddress);
    if (!vault) throw Error(`No vault params found: ${vaultAddress}`);
    return vault.name;
  };

  const getVaultConfig = (vaultAddress: string) => {
    const v = self.configuration?.vaultConfigurations.find(
      (c) => c.id === vaultAddress
    );
    if (!v) throw Error(`Configuration not found for ${vaultAddress}`);
    const primeDebt = getVaultDebt(v.vaultAddress, PRIME_CASH_VAULT_MATURITY);
    const primaryToken = getTokenByID(v.primaryBorrowCurrency.id);
    const adapter = getVaultAdapter(v.vaultAddress);
    const vaultTVL = adapter?.getVaultTVL();

    const minAccountBorrowSize = TokenBalance.from(
      v.minAccountBorrowSize,
      primaryToken
    ).scaleFromInternal();
    const totalUsedPrimaryBorrowCapacity = TokenBalance.from(
      v.totalUsedPrimaryBorrowCapacity,
      primaryToken
    )
      .scaleFromInternal()
      .add(
        primeDebt.totalSupply?.toUnderlying() || TokenBalance.zero(primaryToken)
      );

    const maxPrimaryBorrowCapacity = TokenBalance.from(
      v.maxPrimaryBorrowCapacity,
      primaryToken
    ).scaleFromInternal();

    const minDepositRequired = getMinDepositRequiredString(
      minAccountBorrowSize,
      v.maxDeleverageCollateralRatioBasisPoints,
      v.maxRequiredAccountCollateralRatioBasisPoints as number
    );
    const vaultNameInfo = self.vaults.get(vaultAddress);
    if (!vaultNameInfo)
      throw Error(`No vault name info found: ${vaultAddress}`);

    const vaultType = getVaultType(vaultAddress, self.network);

    const totalBorrowCapacityUsed =
      totalUsedPrimaryBorrowCapacity.toFloat() /
      maxPrimaryBorrowCapacity.toFloat();
    let vaultShareOfPool = 0;
    if (vaultType.startsWith('SingleSidedLP')) {
      vaultShareOfPool =
        (adapter as SingleSidedLP).getPoolShare() /
        (adapter as SingleSidedLP).getMaxPoolShare();
    }
    const vaultUtilization = Math.min(
      Math.max(totalBorrowCapacityUsed, vaultShareOfPool) * 100,
      100
    );

    let rewardTokens: TokenDefinition[] = [];
    if (vaultType === 'SingleSidedLP_DirectClaim') {
      rewardTokens = (adapter as SingleSidedLP).rewardTokens.map(getTokenByID);
    }

    return {
      ...getSnapshot(v),
      ...getSnapshot(vaultNameInfo),
      vaultType: getVaultType(vaultAddress, self.network),
      vaultUtilization,
      rewardTokens,
      primaryToken,
      vaultTVL,
      minDepositRequired,
      minAccountBorrowSize,
      totalUsedPrimaryBorrowCapacity,
      maxPrimaryBorrowCapacity,
    };
  };

  const getAllListedVaults = (
    onlyWhitelisted = true,
    includeDisabled = false
  ) => {
    return (
      self.configuration?.vaultConfigurations
        .filter(
          (v) =>
            (onlyWhitelisted
              ? whitelistedVaults(self.network).includes(
                  v.vaultAddress.toLowerCase() as Lowercase<VaultAddress>
                )
              : true) &&
            (v.enabled || includeDisabled)
        )
        .map((v) => getVaultConfig(v.vaultAddress)) || []
    );
  };

  const getVaultBorrowWithFees = (
    vaultAddress: string,
    maturity: number,
    cashBorrowed: TokenBalance,
    blockTime = getNowSeconds()
  ) => {
    if (cashBorrowed.tokenType !== 'PrimeCash')
      throw Error('Cash must be prime cash');

    if (maturity === PRIME_CASH_VAULT_MATURITY) {
      return {
        cashBorrowed,
        vaultFee: cashBorrowed.copy(0),
        feeRate: RATE_PRECISION,
      };
    }

    const annualizedFeeRate = getVaultConfig(vaultAddress).feeRateBasisPoints;
    const feeRate = Math.floor(
      annualizedFeeRate * ((maturity - blockTime) / SECONDS_IN_YEAR)
    );
    const vaultFee = cashBorrowed.scale(feeRate, RATE_PRECISION);
    return {
      cashBorrowed: cashBorrowed.sub(vaultFee),
      vaultFee,
      feeRate,
    };
  };

  return {
    getAllListedVaults,
    isVaultEnabled,
    getVaultAdapter,
    getVaultName,
    getVaultConfig,
    getVaultBorrowWithFees,
  };
};
