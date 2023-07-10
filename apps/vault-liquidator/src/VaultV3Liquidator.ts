import { ethers, BigNumber, Contract } from 'ethers';
import { RiskyAccount } from './types';
import { AggregateCall, aggregate } from '@notional-finance/sdk/data/Multicall';
import { VaultLiquidatorABI, NotionalV3ABI } from '@notional-finance/contracts';

export type LiquidatorSettings = {
  network: string;
  vaultAddrs: string[];
  flashLiquidatorAddress: string;
  flashLiquidatorOwner: string;
  flashLenderAddress: string;
  notionalAddress: string;
  dustThreshold: BigNumber;
  flashLoanBuffer: BigNumber;
  txRelayUrl: string;
  txRelayAuthToken: string;
  //currencies: Currency[];
  tokens: Map<string, string>;
  //overrides: CurrencyOverride[];
  gasCostBuffer: BigNumber; // Precision = 1000
  profitThreshold: BigNumber;
};

export default class VaultV3Liquidator {
  private liquidatorContract: Contract;
  private notionalContract: Contract;

  constructor(
    public provider: ethers.providers.Provider,
    public settings: LiquidatorSettings
  ) {
    this.liquidatorContract = new ethers.Contract(
      this.settings.flashLiquidatorAddress,
      VaultLiquidatorABI,
      this.provider
    );

    this.notionalContract = new ethers.Contract(
      this.settings.notionalAddress,
      NotionalV3ABI,
      this.provider
    );
  }

  private getAccountHealthCalls(addrs: string[]): AggregateCall[] {
    const calls = [];
    this.settings.vaultAddrs.forEach((vault) => {
      calls.push({
        stage: 0,
        target: this.notionalContract,
        method: 'getVaultConfig',
        args: [vault],
        key: `${vault}:minCollateralRatio`,
        transform: (r) => r[5],
      });

      addrs.forEach((addr) => {
        calls.push({
          stage: 0,
          target: this.notionalContract,
          method: 'getVaultAccountHealthFactors',
          args: [addr, vault],
          key: `${addr}:${vault}:health`,
          transform: (r) => r[0][0],
        });
      });
    });

    return calls;
  }

  public async getRiskyAccounts(addrs: string[]): Promise<RiskyAccount[]> {
    const { results } = await aggregate(
      this.getAccountHealthCalls(addrs),
      this.provider
    );

    const riskyAccounts = [];

    this.settings.vaultAddrs.forEach((vault) => {
      const minCollateralRatio = results[`${vault}:minCollateralRatio`];

      console.log(`minCollateralRatio=${minCollateralRatio.toString()}`);

      addrs.forEach((addr) => {
        const collateralRatio = results[`${addr}:${vault}:health`];

        if (
          collateralRatio
            .sub(minCollateralRatio)
            .lt(this.settings.dustThreshold)
        ) {
          riskyAccounts.push({
            id: addr,
            vault: vault,
            collateralRatio: collateralRatio,
          });
        }
      });
    });

    return riskyAccounts;
  }
}
