import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { SingleSidedLP } from '../../vaults';
import { NetworkModelIntermediateType } from '../NetworkModel';
import { TokenBalance } from '../../token-balance';
import { whitelistedVaults } from '../../config/whitelisted-vaults';
import { getPoolInstance_ } from './ExchangeViews';
import { ChartType } from '../ModelTypes';
import { getSnapshot } from 'mobx-state-tree';

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

export const VaultViews = (self: NetworkModelIntermediateType) => {
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
    const primaryToken = self.getTokenByID(v.primaryBorrowCurrency.id);
    if (!primaryToken.currencyId)
      throw Error(`Token not found for ${vaultAddress}`);

    return new SingleSidedLP(
      self.network,
      vaultAddress,
      params,
      getPoolInstance_(self, params.pool),
      primaryToken.currencyId,
      self.getTimeSeries(v.vaultAddress, ChartType.APY)?.data
    );
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
    const primeDebt = self.getVaultDebt(
      v.vaultAddress,
      PRIME_CASH_VAULT_MATURITY
    );
    const primaryToken = self.getTokenByID(v.primaryBorrowCurrency.id);
    const vaultTVL = getVaultAdapter(v.vaultAddress)?.getVaultTVL();
    const vaultAPY = getVaultAdapter(v.vaultAddress)?.getVaultAPY();
    console.log('vault apy ', vaultAddress, vaultAPY);
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

    return {
      ...v,
      ...self.vaults.get(vaultAddress),
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
              ? whitelistedVaults(self.network).includes(v.vaultAddress)
              : true) &&
            (v.enabled || includeDisabled)
        )
        .map((v) => getVaultConfig(v.vaultAddress)) || []
    );
  };

  return {
    getAllListedVaults,
    isVaultEnabled,
    getVaultAdapter,
    getVaultName,
    getVaultConfig,
  };
};
