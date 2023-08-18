import {
  AccountFetchMode,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { Network, PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { VaultAccountRiskProfile } from '../src/vault-account-risk';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Vault Risk',
  () => {
    const vaultAddress = '0xae38f4b960f44d86e798f36a374a1ac3f2d859fa';
    const maturity = 1695168000;

    describe('Settled Vault Account', () => {
      const settledMaturity = 1687392000;
      it('converts a settled vault account to prime', () => {
        const config = Registry.getConfigurationRegistry();
        Registry.getTokenRegistry().registerToken(
          config.vaultIdToTokenDefinition(
            config.getVaultIDs(
              Network.ArbitrumOne,
              vaultAddress,
              settledMaturity
            ).primaryCashID,
            Network.ArbitrumOne
          )
        );

        const profile = VaultAccountRiskProfile.from(vaultAddress, [
          TokenBalance.fromFloat(
            10,
            Registry.getTokenRegistry().getVaultShare(
              Network.ArbitrumOne,
              vaultAddress,
              settledMaturity
            )
          ),
          TokenBalance.fromFloat(
            -8,
            Registry.getTokenRegistry().getVaultDebt(
              Network.ArbitrumOne,
              vaultAddress,
              settledMaturity
            )
          ),
          TokenBalance.fromFloat(
            2,
            Registry.getTokenRegistry().getVaultCash(
              Network.ArbitrumOne,
              vaultAddress,
              settledMaturity
            )
          ),
        ]);

        // Vault shares and vault cash convert 1-1
        expect(profile.settledBalances.length).toBe(3);
        expect(profile.vaultShares.maturity).toBe(PRIME_CASH_VAULT_MATURITY);
        expect(profile.vaultShares.toFloat()).toBe(10);
        expect(profile.vaultCash.maturity).toBe(PRIME_CASH_VAULT_MATURITY);
        expect(profile.vaultCash.toFloat()).toBe(2);

        // This converts at a non 1-1 rate.
        expect(profile.vaultDebt.maturity).toBe(PRIME_CASH_VAULT_MATURITY);
        expect(profile.vaultDebt.toUnderlying().toFloat()).toBeLessThan(-8);
      });
    });

    describe('Risk Factors', () => {
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
            Registry.getTokenRegistry().getVaultShare(
              Network.ArbitrumOne,
              vaultAddress,
              maturity
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
            Registry.getTokenRegistry().getVaultShare(
              Network.ArbitrumOne,
              vaultAddress,
              maturity
            )
          ),
          TokenBalance.fromFloat(
            -0.9,
            Registry.getTokenRegistry().getVaultDebt(
              Network.ArbitrumOne,
              vaultAddress,
              maturity
            )
          ),
        ]);

        const risks = vaultRiskProfile.getAllRiskFactors();
        expect(risks).toMatchSnapshot();
        // expect(collateralRatio).toBeCloseTo(0.125);
        // expect(leverageRatio).toBeCloseTo(7.7109);
        // expect(liquidationPrice[0].price?.toFloat()).toBeCloseTo(0.9725);
        // expect(assetLiquidationThreshold[0]?.toFloat()).toBeCloseTo(0.9648);
      });

      it('calculates debt with cash leverage ratio and collateral ratio', () => {
        const vaultRiskProfile = VaultAccountRiskProfile.from(vaultAddress, [
          TokenBalance.fromFloat(
            1,
            Registry.getTokenRegistry().getVaultShare(
              Network.ArbitrumOne,
              vaultAddress,
              maturity
            )
          ),
          TokenBalance.fromFloat(
            -0.9,
            Registry.getTokenRegistry().getVaultDebt(
              Network.ArbitrumOne,
              vaultAddress,
              maturity
            )
          ),
          TokenBalance.fromFloat(
            0.01,
            Registry.getTokenRegistry().getVaultCash(
              Network.ArbitrumOne,
              vaultAddress,
              maturity
            )
          ),
        ]);

        const risks = vaultRiskProfile.getAllRiskFactors();
        expect(risks).toMatchSnapshot();
      });
    });

    describe('Max Withdraw', () => {
      it('fCash', () => {
        const vaultRiskProfile = VaultAccountRiskProfile.from(vaultAddress, [
          TokenBalance.fromFloat(
            10,
            Registry.getTokenRegistry().getVaultShare(
              Network.ArbitrumOne,
              vaultAddress,
              maturity
            )
          ),
          TokenBalance.fromFloat(
            -8,
            Registry.getTokenRegistry().getVaultDebt(
              Network.ArbitrumOne,
              vaultAddress,
              maturity
            )
          ),
        ]);

        expect(vaultRiskProfile.maxWithdraw().token.id).toBe(
          vaultRiskProfile.vaultShares.tokenId
        );
        expect(vaultRiskProfile.maxWithdraw().toFloat()).toBeCloseTo(2.094);
      });

      it('Prime Cash', () => {
        const vaultRiskProfile = VaultAccountRiskProfile.from(vaultAddress, [
          TokenBalance.fromFloat(
            10,
            Registry.getTokenRegistry().getVaultShare(
              Network.ArbitrumOne,
              vaultAddress,
              PRIME_CASH_VAULT_MATURITY
            )
          ),
          TokenBalance.fromFloat(
            -8,
            Registry.getTokenRegistry().getVaultDebt(
              Network.ArbitrumOne,
              vaultAddress,
              PRIME_CASH_VAULT_MATURITY
            )
          ),
        ]);

        expect(vaultRiskProfile.maxWithdraw().token.id).toBe(
          vaultRiskProfile.vaultShares.tokenId
        );
        expect(vaultRiskProfile.maxWithdraw().toFloat()).toBeCloseTo(1.959);
      });

      it('fCash + Cash', () => {
        const vaultRiskProfile = VaultAccountRiskProfile.from(vaultAddress, [
          TokenBalance.fromFloat(
            10,
            Registry.getTokenRegistry().getVaultShare(
              Network.ArbitrumOne,
              vaultAddress,
              maturity
            )
          ),
          TokenBalance.fromFloat(
            -8,
            Registry.getTokenRegistry().getVaultDebt(
              Network.ArbitrumOne,
              vaultAddress,
              maturity
            )
          ),
          TokenBalance.fromFloat(
            2,
            Registry.getTokenRegistry().getVaultCash(
              Network.ArbitrumOne,
              vaultAddress,
              maturity
            )
          ),
        ]);

        expect(vaultRiskProfile.maxWithdraw().token.id).toBe(
          vaultRiskProfile.vaultShares.tokenId
        );
        expect(vaultRiskProfile.maxWithdraw().toFloat()).toBeCloseTo(4.093);
      });
    });
  }
);
