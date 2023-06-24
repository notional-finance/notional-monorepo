import {
  AccountFetchMode,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  AssetType,
  Network,
  PRIME_CASH_VAULT_MATURITY,
  ZERO_ADDRESS,
  encodeERC1155Id,
  getNowSeconds,
} from '@notional-finance/util';
import { VaultAccountRiskProfile } from '../src/vault-account-risk';
import { ethers } from 'ethers';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Vault Risk',
  () => {
    const vaultAddress = '0x1111111111111111111111111111111111111111';
    const maturity = 1695168000;
    const vaultSharefCash = encodeERC1155Id(
      1,
      maturity,
      AssetType.VAULT_SHARE_ASSET_TYPE,
      false,
      vaultAddress
    );
    const vaultDebtfCash = encodeERC1155Id(
      1,
      maturity,
      AssetType.VAULT_DEBT_ASSET_TYPE,
      false,
      vaultAddress
    );
    const vaultCashfCash = encodeERC1155Id(
      1,
      maturity,
      AssetType.VAULT_CASH_ASSET_TYPE,
      false,
      vaultAddress
    );
    const vaultSharePrime = encodeERC1155Id(
      1,
      maturity,
      AssetType.VAULT_SHARE_ASSET_TYPE,
      false,
      vaultAddress
    );
    const vaultDebtPrime = encodeERC1155Id(
      1,
      maturity,
      AssetType.VAULT_DEBT_ASSET_TYPE,
      false,
      vaultAddress
    );
    const vaultCashPrime = encodeERC1155Id(
      1,
      maturity,
      AssetType.VAULT_CASH_ASSET_TYPE,
      false,
      vaultAddress
    );

    const vaultShareProps = {
      address: vaultAddress,
      network: Network.ArbitrumOne,
      name: 'Vault Share',
      symbol: 'Vault Share',
      decimals: 8,
      tokenInterface: 'ERC1155',
      tokenType: 'VaultShare',
      underlying: ZERO_ADDRESS,
      vaultAddress,
      isFCashDebt: false,
      currencyId: 1,
    } as TokenDefinition;

    beforeAll(() => {
      // Register a fake vault
      Registry.getConfigurationRegistry().updateVaultConfiguration(
        Network.ArbitrumOne,
        [
          {
            id: vaultAddress,
            vaultAddress,
            primaryBorrowCurrency: { id: ZERO_ADDRESS },
            minCollateralRatioBasisPoints: 0.08e9,
          },
        ]
      );
      const tokens = Registry.getTokenRegistry();

      tokens.registerToken({
        ...vaultShareProps,
        id: vaultSharefCash,
        maturity,
      });

      tokens.registerToken({
        ...vaultShareProps,
        id: vaultSharePrime,
        maturity: PRIME_CASH_VAULT_MATURITY,
      });

      tokens.registerToken({
        ...vaultShareProps,
        tokenType: 'VaultDebt',
        id: vaultDebtfCash,
        maturity,
      });

      tokens.registerToken({
        ...vaultShareProps,
        tokenType: 'VaultDebt',
        id: vaultDebtPrime,
        maturity: PRIME_CASH_VAULT_MATURITY,
      });

      tokens.registerToken({
        ...vaultShareProps,
        tokenType: 'VaultCash',
        id: vaultCashfCash,
        maturity,
      });

      tokens.registerToken({
        ...vaultShareProps,
        tokenType: 'VaultCash',
        id: vaultCashPrime,
        maturity: PRIME_CASH_VAULT_MATURITY,
      });

      Registry.getOracleRegistry().registerOracle(Network.ArbitrumOne, {
        id: vaultSharefCash,
        oracleAddress: ZERO_ADDRESS,
        network: Network.ArbitrumOne,
        oracleType: 'VaultShareOracleRate',
        base: ZERO_ADDRESS,
        quote: vaultSharefCash,
        decimals: 18,
        latestRate: {
          rate: ethers.constants.WeiPerEther,
          timestamp: getNowSeconds(),
          blockNumber: 1,
        },
      });

      Registry.getOracleRegistry().registerOracle(Network.ArbitrumOne, {
        id: vaultSharePrime,
        oracleAddress: ZERO_ADDRESS,
        network: Network.ArbitrumOne,
        oracleType: 'VaultShareOracleRate',
        base: ZERO_ADDRESS,
        quote: vaultSharePrime,
        decimals: 18,
        latestRate: {
          rate: ethers.constants.WeiPerEther,
          timestamp: getNowSeconds(),
          blockNumber: 1,
        },
      });
    });

    it('calculates empty leverage ratio and collateral ratio', () => {
      const vaultRiskProfile = VaultAccountRiskProfile.empty(
        Network.ArbitrumOne,
        vaultAddress,
        maturity
      );

      expect(vaultRiskProfile.leverageRatio()).toBe(null);
      expect(vaultRiskProfile.collateralRatio()).toBe(null);
    });

    it('calculates no debt leverage ratio and collateral ratio', () => {
      const vaultRiskProfile = VaultAccountRiskProfile.from(vaultAddress, [
        TokenBalance.fromFloat(
          1,
          Registry.getTokenRegistry().getTokenByID(
            Network.ArbitrumOne,
            vaultSharefCash
          )
        ),
      ]);

      expect(vaultRiskProfile.leverageRatio()).toBe(null);
      expect(vaultRiskProfile.collateralRatio()).toBe(null);
    });

    it('calculates debt leverage ratio and collateral ratio', () => {
      const vaultRiskProfile = VaultAccountRiskProfile.from(vaultAddress, [
        TokenBalance.fromFloat(
          1,
          Registry.getTokenRegistry().getTokenByID(
            Network.ArbitrumOne,
            vaultSharefCash
          )
        ),
        TokenBalance.fromFloat(
          -0.9,
          Registry.getTokenRegistry().getTokenByID(
            Network.ArbitrumOne,
            vaultDebtfCash
          )
        ),
      ]);

      const {
        collateralRatio,
        leverageRatio,
        liquidationPrice,
        collateralLiquidationThreshold,
      } = vaultRiskProfile.getAllRiskFactors();
      expect(collateralRatio).toBeCloseTo(0.125);
      expect(leverageRatio).toBeCloseTo(7.992);
      expect(liquidationPrice[0].price?.toFloat()).toBeCloseTo(0.9599);
      expect(collateralLiquidationThreshold[0]?.toFloat()).toBeCloseTo(0.9599);
    });

    it('calculates debt with cash leverage ratio and collateral ratio', () => {
      const vaultRiskProfile = VaultAccountRiskProfile.from(vaultAddress, [
        TokenBalance.fromFloat(
          1,
          Registry.getTokenRegistry().getTokenByID(
            Network.ArbitrumOne,
            vaultSharefCash
          )
        ),
        TokenBalance.fromFloat(
          -0.9,
          Registry.getTokenRegistry().getTokenByID(
            Network.ArbitrumOne,
            vaultDebtfCash
          )
        ),
        TokenBalance.fromFloat(
          0.01,
          Registry.getTokenRegistry().getTokenByID(
            Network.ArbitrumOne,
            vaultCashfCash
          )
        ),
      ]);

      const {
        collateralRatio,
        leverageRatio,
        liquidationPrice,
        collateralLiquidationThreshold,
      } = vaultRiskProfile.getAllRiskFactors();
      expect(collateralRatio).toBeCloseTo(0.138);
      expect(leverageRatio).toBeCloseTo(7.251);
      expect(liquidationPrice[0].price?.toFloat()).toBeCloseTo(0.9491);
      expect(collateralLiquidationThreshold[0]?.toFloat()).toBeCloseTo(0.9491);
    });
  }
);
