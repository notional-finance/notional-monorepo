import { Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';
import {
  AssetType,
  decodeERC1155Id,
  encodeERC1155Id,
  getMaturityForMarketIndex,
  getNowSeconds,
  getProviderFromNetwork,
  INTERNAL_TOKEN_PRECISION,
  Network,
  NotionalAddress,
  PRIME_CASH_VAULT_MATURITY,
  SCALAR_PRECISION,
} from '@notional-finance/util';
import {
  OracleDefinition,
  TokenDefinition,
  TokenType,
} from '../../Definitions';
import { BigNumber, Contract } from 'ethers';
import {
  ISingleSidedLPStrategyVault,
  ISingleSidedLPStrategyVaultABI,
  SecondaryRewarder,
  SecondaryRewarderABI,
} from '@notional-finance/contracts';
import { TokenBalance } from '../../token-balance';

export function assertDefined<T>(v: T | null | undefined): T {
  if (v === undefined || v === null) throw Error(`Undefined Value`);
  return v as T;
}

export const ConfigurationViews = (self: Instance<typeof NetworkModel>) => {
  const getConfig = (currencyId: number) => {
    const config = self.configuration?.currencyConfigurations.find(
      (c) => c.id === `${currencyId}`
    );
    if (!config) throw Error(`Configuration not found for ${currencyId}`);
    return config;
  };

  const getVaultConfig = (vaultAddress: string) => {
    const config = self.configuration?.vaultConfigurations.find(
      (c) => c.id === vaultAddress
    );
    if (!config) throw Error(`Configuration not found for ${vaultAddress}`);
    return config;
  };

  const getAllListedVaults = (includeDisabled = false) => {
    return self.configuration?.vaultConfigurations.filter(
      (v) => v.enabled || includeDisabled
    );
  };

  const getSecondaryRewarder = (nToken: TokenDefinition) => {
    if (!nToken.currencyId) throw Error('Invalid nToken');
    const config = getConfig(nToken.currencyId);

    return config?.incentives?.secondaryIncentiveRewarder
      ? (new Contract(
          config.incentives?.secondaryIncentiveRewarder,
          SecondaryRewarderABI,
          getProviderFromNetwork(nToken.network)
        ) as SecondaryRewarder)
      : undefined;
  };

  const getAnnualizedSecondaryIncentives = (nToken: TokenDefinition) => {
    if (!nToken.currencyId) throw Error('Invalid nToken');
    const config = getConfig(nToken.currencyId);
    if (!config?.incentives?.currentSecondaryReward) return undefined;
    const rewardEndTime = config?.incentives?.secondaryRewardEndTime
      ? parseInt(config.incentives.secondaryRewardEndTime)
      : undefined;
    if (rewardEndTime && rewardEndTime < getNowSeconds()) return undefined;

    const rewardToken = self.tokens.get(
      config.incentives.currentSecondaryReward.id
    );
    if (!rewardToken) throw Error('Unknown reward token');

    const incentiveEmissionRate = TokenBalance.fromFloat(
      BigNumber.from(
        (config.incentives.secondaryEmissionRate as string | undefined) || 0
      ).toNumber() / INTERNAL_TOKEN_PRECISION,
      rewardToken
    );
    const accumulatedRewardPerNToken = config.incentives
      ?.accumulatedSecondaryRewardPerNToken
      ? TokenBalance.from(
          // This value is stored in 18 decimals but we want to scale it to reward token precision
          BigNumber.from(config.incentives.accumulatedSecondaryRewardPerNToken)
            .mul(TokenBalance.unit(rewardToken).precision)
            .div(SCALAR_PRECISION),
          rewardToken
        )
      : undefined;

    return {
      rewardToken,
      incentiveEmissionRate,
      accumulatedRewardPerNToken,
      lastAccumulatedTime: config.incentives?.lastSecondaryAccumulatedTime
        ? parseInt(config.incentives.lastSecondaryAccumulatedTime)
        : undefined,
      rewardEndTime,
    };
  };

  return {
    getConfig,
    getVaultConfig,
    getAllListedVaults,
    getSecondaryRewarder,
    getAnnualizedSecondaryIncentives,
  };
};

export const registerVaultData = async (
  self: Instance<typeof NetworkModel>
) => {
  self.configuration?.vaultConfigurations.forEach(async (vault) => {
    // Get all the active maturities for the vault
    const activeMaturities = [...Array(vault.maxBorrowMarketIndex).keys()]
      .map((i) => getMaturityForMarketIndex(i + 1))
      .concat(PRIME_CASH_VAULT_MATURITY);

    const primaryBorrow = self.tokens.get(vault.primaryBorrowCurrency.id);
    const primaryBorrowCurrencyId = primaryBorrow?.currencyId;
    if (!primaryBorrowCurrencyId)
      throw Error('Unknown primary borrow currency');

    activeMaturities.forEach(async (maturity) => {
      // Register all vault tokens
      const vaultShareID = encodeERC1155Id(
        primaryBorrowCurrencyId,
        maturity,
        AssetType.VAULT_SHARE_ASSET_TYPE,
        false,
        vault.vaultAddress
      );

      if (!self.tokens.has(vaultShareID)) {
        self.tokens.set(
          vaultShareID,
          getTokenDefinitionForVaultId(
            vaultShareID,
            self.network,
            primaryBorrow
          )
        );
      }

      registerVaultDebtAndCashIds(
        vault.vaultAddress,
        primaryBorrowCurrencyId,
        maturity,
        self.network,
        primaryBorrow,
        self.tokens
      );

      if (vault.secondaryBorrowCurrencies) {
        if (vault.secondaryBorrowCurrencies.length > 0) {
          const secondaryUnderlying = self.tokens.get(
            vault.secondaryBorrowCurrencies[0].id
          );
          const secondaryCurrencyId = secondaryUnderlying?.currencyId;
          if (secondaryCurrencyId) {
            registerVaultDebtAndCashIds(
              vault.vaultAddress,
              secondaryCurrencyId,
              maturity,
              self.network,
              secondaryUnderlying,
              self.tokens
            );
          }
        }
        if (vault.secondaryBorrowCurrencies.length > 1) {
          const secondaryUnderlying = self.tokens.get(
            vault.secondaryBorrowCurrencies[1].id
          );
          const secondaryCurrencyId = secondaryUnderlying?.currencyId;
          if (secondaryCurrencyId) {
            registerVaultDebtAndCashIds(
              vault.vaultAddress,
              secondaryCurrencyId,
              maturity,
              self.network,
              secondaryUnderlying,
              self.tokens
            );
          }
        }
      }

      // Register vault oracles if there is no oracle already registered
      const oracleId = `${primaryBorrow.id}:${vaultShareID}:VaultShareOracleRate`;
      if (!self.oracles.has(oracleId)) {
        try {
          const vaultContract = new Contract(
            vault.vaultAddress,
            ISingleSidedLPStrategyVaultABI
          ) as ISingleSidedLPStrategyVault;
          const rate = await vaultContract.getExchangeRate(maturity);

          const oracle: OracleDefinition = {
            id: oracleId,
            oracleAddress: vault.vaultAddress,
            network: self.network,
            oracleType: 'VaultShareOracleRate',
            base: primaryBorrow.id,
            quote: vaultShareID,
            decimals: primaryBorrow.decimals,
            latestRate: {
              rate,
              timestamp: 0,
              blockNumber: 0,
            },
          };

          self.oracles.set(oracle.id, oracle);
        } catch (e) {
          console.error(
            'Error registering oracle for vault',
            vault.vaultAddress,
            maturity,
            e
          );
        }
      }
    });
  });
};

const registerVaultDebtAndCashIds = (
  vaultAddress: string,
  currencyId: number,
  maturity: number,
  network: Network,
  underlying: TokenDefinition,
  tokens: Instance<typeof NetworkModel>['tokens']
) => {
  const debtID = encodeERC1155Id(
    currencyId,
    maturity,
    AssetType.VAULT_DEBT_ASSET_TYPE,
    false,
    vaultAddress
  );

  const cashID = encodeERC1155Id(
    currencyId,
    maturity,
    AssetType.VAULT_CASH_ASSET_TYPE,
    false,
    vaultAddress
  );

  if (!tokens.has(debtID)) {
    tokens.set(
      debtID,
      getTokenDefinitionForVaultId(debtID, network, underlying)
    );
  }

  if (!tokens.has(cashID)) {
    tokens.set(
      cashID,
      getTokenDefinitionForVaultId(cashID, network, underlying)
    );
  }
};

const getTokenDefinitionForVaultId = (
  id: string,
  network: Network,
  underlying: TokenDefinition
): TokenDefinition => {
  const { assetType, maturity, vaultAddress } = decodeERC1155Id(id);
  if (!vaultAddress) throw Error('Undefined vault address');

  const vaultMaturityString =
    maturity === PRIME_CASH_VAULT_MATURITY
      ? ' Open Term'
      : ' Fixed Term @ ' + maturity;
  const vaultMaturitySymbol =
    maturity == PRIME_CASH_VAULT_MATURITY ? ':open' : ':fixed@' + maturity;

  let name: string;
  let symbol: string;
  let tokenType: TokenType;
  if (assetType == AssetType.VAULT_SHARE_ASSET_TYPE) {
    tokenType = 'VaultShare';
    name =
      'Vault Shares in ' +
      underlying.symbol +
      ' for ' +
      vaultAddress +
      vaultMaturityString;
    symbol =
      'vs' + underlying.symbol + ':' + vaultAddress + vaultMaturitySymbol;
  } else if (assetType == AssetType.VAULT_DEBT_ASSET_TYPE) {
    tokenType = 'VaultDebt';
    name =
      'Vault ' +
      underlying.symbol +
      ' Debt for ' +
      vaultAddress +
      vaultMaturityString;
    symbol =
      'vd' + underlying.symbol + ':' + vaultAddress + vaultMaturitySymbol;
  } else if (assetType == AssetType.VAULT_CASH_ASSET_TYPE) {
    tokenType = 'VaultCash';
    name =
      'Vault ' +
      underlying.symbol +
      ' Cash for ' +
      vaultAddress +
      vaultMaturityString;
    symbol =
      'vc' + underlying.symbol + ':' + vaultAddress + vaultMaturitySymbol;
  } else {
    throw Error('Unknown vault token type');
  }

  return {
    id,
    address: NotionalAddress[network].toLowerCase(),
    network,
    name,
    symbol,
    decimals: 8,
    tokenInterface: 'ERC1155',
    tokenType,
    underlying: underlying.id,
    maturity,
    vaultAddress: vaultAddress.toLowerCase(),
    isFCashDebt: false,
    currencyId: underlying.currencyId,
  };
};
