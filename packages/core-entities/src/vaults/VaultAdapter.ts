import { BytesLike } from 'ethers';
import { TokenBalance } from '../token-balance';
import { Network } from '@notional-finance/util';
import {
  ExchangeRate,
  OracleDefinition,
  TokenDefinition,
} from '../Definitions';
import { Registry } from '../Registry';

export interface BaseVaultParams {
  enabled: boolean;
  name: string;
}

export abstract class VaultAdapter {
  abstract get hashKey(): string;
  abstract get strategy(): string;

  constructor(
    public enabled: boolean,
    public name: string,
    public network: Network,
    public vaultAddress: string
  ) {
    // NO-OP
  }

  protected _initOracles(network: Network, vaultAddress: string) {
    const oracles = Registry.getOracleRegistry();
    const config = Registry.getConfigurationRegistry();
    const tokens = Registry.getTokenRegistry();

    // Registers oracles if they do not exist yet
    config
      .getVaultActiveMaturities(network, vaultAddress)
      .forEach((maturity) => {
        const vaultShare = tokens.getVaultShare(
          network,
          vaultAddress,
          maturity
        );
        if (!vaultShare.underlying) throw Error('Unknown underlying');
        const underlying = tokens.getTokenByID(network, vaultShare.underlying);

        const oracle: OracleDefinition = {
          id: `${underlying.id}:${vaultShare.id}:VaultShareOracleRate`,
          oracleAddress: vaultAddress,
          network,
          oracleType: 'VaultShareOracleRate',
          base: underlying.id,
          quote: vaultShare.id,
          decimals: underlying.decimals,
          latestRate: this.getInitialVaultShareValuation(maturity),
        };
        oracles.registerOracle(network, oracle);
      });
  }

  getBorrowedToken() {
    return Registry.getTokenRegistry().getTokenByID(
      this.network,
      Registry.getConfigurationRegistry().getVaultConfig(
        this.network,
        this.vaultAddress
      ).primaryBorrowCurrency.id
    );
  }

  abstract getInitialVaultShareValuation(maturity: number): ExchangeRate;

  abstract convertToPrimeVaultShares(vaultShares: TokenBalance): TokenBalance;

  abstract getNetVaultSharesCost(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  };

  abstract getNetVaultSharesMinted(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
  };

  abstract getDepositParameters(
    account: string,
    maturity: number,
    totalDeposit: TokenBalance,
    slippageFactor: number
  ): Promise<BytesLike>;

  abstract getRedeemParameters(
    account: string,
    maturity: number,
    vaultSharesToRedeem: TokenBalance,
    underlyingToRepayDebt: TokenBalance,
    slippageFactor: number
  ): Promise<BytesLike>;

  abstract getVaultAPY(factors?: {
    account: string;
    vaultShares: TokenBalance;
    maturity: number;
  }): number;

  getVaultTVL(): TokenBalance {
    const vaultShares = Registry.getTokenRegistry()
      .getAllTokens(this.network)
      .filter(
        (t) =>
          t.tokenType === 'VaultShare' && t.vaultAddress === this.vaultAddress
      );

    return vaultShares.reduce(
      (acc, v) => (v.totalSupply ? acc.add(v.totalSupply.toUnderlying()) : acc),
      TokenBalance.zero(this.getBorrowedToken())
    );
  }
}
