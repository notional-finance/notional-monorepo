import { Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';
import {
  AssetType,
  decodeERC1155Id,
  encodeERC1155Id,
  getMaturityForMarketIndex,
  getProviderFromNetwork,
  INTERNAL_TOKEN_PRECISION,
  Network,
  NotionalAddress,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  SCALAR_PRECISION,
  TokenAddress,
  VaultAddress,
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
import { ExchangeViews } from './ExchangeViews';
import { interestToExchangeRate } from './OracleViews';
import { TokenBalance } from '../../token-balance';

export function assertDefined<T>(v: T | null | undefined): T {
  if (v === undefined || v === null) throw Error(`Undefined Value`);
  return v as T;
}

export const ConfigurationViews = (self: Instance<typeof NetworkModel>) => {
  const { getfCashMarket } = ExchangeViews(self);

  const getConfig = (currencyId: number) => {
    const config = self.configuration?.currencyConfigurations.find(
      (c) => c.id === `${currencyId}`
    );
    if (!config) throw Error(`Configuration not found for ${currencyId}`);
    return config;
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

  const getCurrencyHaircutAndBuffer = (token: TokenDefinition) => {
    if (!token.currencyId) throw Error('Invalid token currency');
    const config = getConfig(token.currencyId);
    return {
      haircut: assertDefined(config.collateralHaircut),
      buffer: assertDefined(config.debtBuffer),
    };
  };

  const getMinLendRiskAdjustedDiscountFactor = (fCash: TokenDefinition) => {
    if (!fCash.currencyId || !fCash.maturity) throw Error('Invalid fCash');
    const config = getConfig(fCash.currencyId);
    const fCashMarket = getfCashMarket(fCash.currencyId);
    const marketIndex = fCashMarket.getMarketIndex(fCash.maturity);

    // Convert this to an exchange rate
    const maxMarketInterestRate =
      fCashMarket.poolParams.interestRateCurve[marketIndex - 1].maxRate -
      assertDefined(config.fCashHaircutBasisPoints);
    const maxInterestRate = Math.max(
      maxMarketInterestRate,
      assertDefined(config.fCashMinOracleRate)
    );

    const discountRate = interestToExchangeRate(
      BigNumber.from(maxInterestRate).mul(-1),
      fCash.maturity
    )
      .mul(RATE_PRECISION)
      .div(SCALAR_PRECISION);

    const lowestDiscountFactor = Math.min(
      discountRate.toNumber(),
      assertDefined(config.fCashMaxDiscountFactor)
    );

    return {
      lowestDiscountFactor,
      maxDiscountFactor: assertDefined(config.fCashMaxDiscountFactor),
    };
  };

  const getTotalAnnualEmission = () => {
    const totalEmissions =
      self.configuration?.currencyConfigurations?.reduce(
        (s, c) =>
          c.incentives?.incentiveEmissionRate
            ? s.add(c.incentives.incentiveEmissionRate)
            : s,
        BigNumber.from(0)
      ) || BigNumber.from(0);

    return new TokenBalance(
      totalEmissions.mul(INTERNAL_TOKEN_PRECISION),
      'NOTE',
      Network.all
    );
  };

  return {
    getConfig,
    getSecondaryRewarder,
    getCurrencyHaircutAndBuffer,
    getMinLendRiskAdjustedDiscountFactor,
    getTotalAnnualEmission,
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

    const primaryBorrow = self.tokens.get(vault.primaryBorrowCurrency.id) as
      | TokenDefinition
      | undefined;
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
          ) as TokenDefinition | undefined;
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
          ) as TokenDefinition | undefined;
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
    address: NotionalAddress[network].toLowerCase() as Lowercase<TokenAddress>,
    network,
    name,
    symbol,
    decimals: 8,
    tokenInterface: 'ERC1155',
    tokenType,
    underlying: underlying.id,
    maturity,
    vaultAddress: vaultAddress.toLowerCase() as Lowercase<VaultAddress>,
    isFCashDebt: false,
    currencyId: underlying.currencyId,
  };
};
