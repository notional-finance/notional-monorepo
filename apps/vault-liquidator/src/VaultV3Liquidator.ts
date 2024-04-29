import { ethers, BigNumber, Contract, PopulatedTransaction } from 'ethers';
import { RiskyAccount } from './types';
import {
  AggregateCall,
  aggregate,
  getMulticall,
} from '@notional-finance/multicall';
import {
  VaultLiquidatorABI,
  NotionalV3ABI,
  NotionalV3,
  ISingleSidedLPStrategyVaultABI,
  VaultLiquidator,
} from '@notional-finance/contracts';
import { Logger } from '@notional-finance/durable-objects';
import {
  INTERNAL_TOKEN_PRECISION,
  Network,
  ZERO_ADDRESS,
  sendTxThroughRelayer,
} from '@notional-finance/util';

export type LiquidatorSettings = {
  network: Network;
  vaultAddrs: string[];
  flashLiquidatorAddress: string;
  flashLiquidatorOwner: string;
  flashLenderAddress: string;
  slippageLimit: BigNumber;
  notionalAddress: string;
  dustThreshold: BigNumber;
  flashLoanBuffer: BigNumber;
  txRelayUrl: string;
  txRelayAuthToken: string;
  tokens: Map<string, string>;
  gasCostBuffer: BigNumber; // Precision = 1000
  profitThreshold: BigNumber;
  zeroExUrl: string;
  zeroExApiKey: string;
};

export enum LiquidationType {
  UNKNOWN = 0,
  DELEVERAGE_VAULT_ACCOUNT = 1,
  LIQUIDATE_CASH_BALANCE = 2,
  DELEVERAGE_VAULT_ACCOUNT_AND_LIQUIDATE_CASH = 3,
}
export default class VaultV3Liquidator {
  public liquidatorContract: VaultLiquidator;
  private notionalContract: Contract;

  constructor(
    public provider: ethers.providers.Provider,
    public settings: LiquidatorSettings,
    private logger: Logger
  ) {
    this.liquidatorContract = new ethers.Contract(
      this.settings.flashLiquidatorAddress,
      VaultLiquidatorABI,
      this.provider
    ) as VaultLiquidator;

    this.notionalContract = new ethers.Contract(
      this.settings.notionalAddress,
      NotionalV3ABI,
      this.provider
    );
  }

  public async getVaultConfig(vault: string) {
    const { results } = await aggregate(
      [
        {
          stage: 0,
          target: this.notionalContract,
          method: 'getVaultConfig',
          args: [vault],
          key: 'config',
        },
        {
          stage: 1,
          target: this.notionalContract,
          method: 'getCurrency',
          args: (r) => [r['config']['borrowCurrencyId']],
          key: 'currency',
        },
      ],
      this.provider
    );

    return {
      config: results['config'] as Awaited<
        ReturnType<NotionalV3['getVaultConfig']>
      >,
      borrowToken: results['currency'] as Awaited<
        ReturnType<NotionalV3['getCurrency']>
      >['underlyingToken'],
    };
  }

  private getAccountHealthCalls(
    accounts: { account_id: string; vault_id: string }[]
  ): AggregateCall[] {
    return accounts.flatMap(({ account_id, vault_id }) => {
      return [
        {
          stage: 0,
          target: this.notionalContract,
          method: 'getVaultAccountHealthFactors',
          args: [account_id, vault_id],
          key: `${account_id.toLowerCase()}:${vault_id.toLowerCase()}:health`,
          transform: (
            r: Awaited<ReturnType<NotionalV3['getVaultAccountHealthFactors']>>
          ) => ({
            collateralRatio: r[0].collateralRatio,
            maxLiquidatorDepositUnderlying: r.maxLiquidatorDepositUnderlying,
            vaultSharesToLiquidator: r.vaultSharesToLiquidator,
          }),
        },
        {
          stage: 0,
          target: this.notionalContract,
          method: 'getVaultAccount',
          args: [account_id, vault_id],
          key: `${account_id}:${vault_id}:maturity`,
          transform: (r: Awaited<ReturnType<NotionalV3['getVaultAccount']>>) =>
            r.maturity,
        },
      ];
    });
  }

  public async getRiskyAccounts(
    accounts: { account_id: string; vault_id: string }[]
  ) {
    const { results } = await aggregate(
      this.getAccountHealthCalls(accounts),
      this.provider
    );

    const riskyAccounts = [];

    accounts.forEach(({ account_id, vault_id }) => {
      const accountHealth = results[
        `${account_id}:${vault_id}:health`.toLowerCase()
      ] as {
        collateralRatio: BigNumber;
        maxLiquidatorDepositUnderlying: [BigNumber, BigNumber, BigNumber];
        vaultSharesToLiquidator: [BigNumber, BigNumber, BigNumber];
      };
      const maturity = results[
        `${account_id}:${vault_id}:maturity`.toLowerCase()
      ] as BigNumber;

      if (
        // If there is any value here, we can liquidate
        accountHealth.maxLiquidatorDepositUnderlying[0].gt(BigNumber.from(0))
      ) {
        riskyAccounts.push({
          id: account_id,
          maturity: maturity,
          vault: vault_id,
          collateralRatio: accountHealth.collateralRatio,
          maxLiquidatorDepositUnderlying:
            accountHealth.maxLiquidatorDepositUnderlying,
          vaultSharesToLiquidator: accountHealth.vaultSharesToLiquidator,
        });
      }
    });

    return riskyAccounts;
  }

  /** Need to create new versions of this function for different vaults */
  private async getSingleSidedLPRedeemData(
    vault: string,
    maturity: number,
    totalVaultShares: BigNumber
  ) {
    const vaultContract = new ethers.Contract(
      vault,
      ISingleSidedLPStrategyVaultABI,
      this.provider
    );

    const { results } = await aggregate(
      [
        {
          stage: 0,
          target: vaultContract,
          method: 'convertStrategyToUnderlying',
          args: [ZERO_ADDRESS, totalVaultShares, maturity],
          key: 'vaultShareValue',
        },
        {
          stage: 0,
          target: vaultContract,
          method: 'getStrategyVaultInfo',
          args: [],
          key: 'strategyVaultInfo',
        },
        {
          stage: 0,
          target: vaultContract,
          method: 'TOKENS',
          args: [],
          key: 'TOKENS',
        },
      ],
      this.provider
    );

    const minPrimary = (results['vaultShareValue'] as BigNumber)
      .mul(this.settings.slippageLimit)
      .div(1000);
    const minAmount = new Array(results['TOKENS'][0].length).fill(
      BigNumber.from(0)
    );
    minAmount[results['strategyVaultInfo']['singleSidedTokenIndex'] as number] =
      minPrimary;
    return ethers.utils.defaultAbiCoder.encode(
      ['tuple(uint256[],bytes)'],
      [[minAmount, []]]
    );
  }

  public async getBatchParams(
    vault: string,
    maturity: number,
    riskyAccounts: RiskyAccount[],
    assetPrecision: BigNumber,
    currencyIndex = 0
  ) {
    const totalFlashLoan = riskyAccounts.reduce(
      (s, r) => s.add(r.maxLiquidatorDepositUnderlying[currencyIndex]),
      BigNumber.from(0)
    );
    const totalVaultShares = riskyAccounts.reduce(
      (s, r) => s.add(r.vaultSharesToLiquidator[currencyIndex]),
      BigNumber.from(0)
    );
    const redeemData = await this.getSingleSidedLPRedeemData(
      vault,
      maturity,
      totalVaultShares
    );

    return {
      flashLoanAmount: totalFlashLoan
        .mul(assetPrecision)
        .div(INTERNAL_TOKEN_PRECISION),
      redeemData,
    };
  }

  async liquidateViaMulticall(batch: PopulatedTransaction[]) {
    const multicall = getMulticall(this.provider);
    const pop = await multicall.populateTransaction.aggregate3(
      batch.map((p) => ({
        target: p.to,
        allowFailure: true,
        callData: p.data,
      }))
    );

    return await sendTxThroughRelayer({
      env: {
        NETWORK: this.settings.network,
        TX_RELAY_AUTH_TOKEN: this.settings.txRelayAuthToken,
      },
      to: multicall.address,
      data: pop.data,
      isLiquidator: true,
    });
  }
}

// public async getLiquidationParams(ra: RiskyAccount) {
//   const liqParams =
//     await this.liquidatorContract.callStatic.getOptimalDeleveragingParams(
//       ra.id,
//       ra.vault
//     );

//   const { results } = await aggregate(
//     this.getLiquidationInfoCalls(ra, liqParams.currencyIndex),
//     this.provider
//   );

//   let assetAddress = results['assetAddress'] as string;
//   assetAddress =
//     overrides[this.settings.network][assetAddress] || assetAddress;
//   const flashLoanAmount = (results['depositAmount'] as BigNumber)
//     .mul(this.settings.flashLoanBuffer)
//     .div(1000);
//   const minPrimary = (results['primaryAmount'] as BigNumber)
//     .mul(this.settings.slippageLimit)
//     .div(1000);
//   const minAmount = new Array(results['TOKENS'][0].length).fill(
//     BigNumber.from(0)
//   );
//   minAmount[results['strategyVaultInfo']['singleSidedTokenIndex'] as number] =
//     minPrimary;

//   const callParams = {
//     // Use this as the default type, will account for variable rate debt
//     liquidationType: LiquidationType.DELEVERAGE_VAULT_ACCOUNT,
//     currencyId: ra.borrowCurrencyId,
//     currencyIndex: liqParams.currencyIndex,
//     account: ra.id,
//     vault: ra.vault,
//     useVaultDeleverage: true,
//     actionData: ethers.utils.defaultAbiCoder.encode(
//       ['tuple(uint256[],bytes)'],
//       [[minAmount, []]]
//     ),
//   };

//   return {
//     account: ra,
//     currencyIndex: liqParams.currencyIndex,
//     maxUnderlying: liqParams.maxUnderlying,
//     assetAddress: assetAddress,
//     flashLoanAmount: flashLoanAmount,
//     callParams: callParams,
//   };
// }
