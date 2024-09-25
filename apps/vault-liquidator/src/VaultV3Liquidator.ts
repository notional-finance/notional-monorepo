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
import {
  INTERNAL_TOKEN_PRECISION,
  Network,
  ZERO_ADDRESS,
  groupArrayToMap,
  sendTxThroughRelayer,
  getFlashLender,
  WETHAddress,
} from '@notional-finance/util';
import { Logger } from '@notional-finance/util';
import {
  getVaultType,
  VaultDefaultDexParameters,
} from '@notional-finance/core-entities';

export type LiquidatorSettings = {
  network: Network;
  vaultAddrs: string[];
  flashLiquidatorAddress: string[];
  flashLiquidatorOwner: string;
  slippageLimit: BigNumber;
  notionalAddress: string;
  flashLoanBuffer: BigNumber;
  txRelayUrl: string;
  txRelayAuthToken: string;
  maxLiquidationsPerBatch: number;
};

enum LiquidationType {
  UNKNOWN = 0,
  DELEVERAGE_VAULT_ACCOUNT = 1,
  LIQUIDATE_CASH_BALANCE = 2,
  DELEVERAGE_VAULT_ACCOUNT_AND_LIQUIDATE_CASH = 3,
}

export default class VaultV3Liquidator {
  public liquidatorContracts: VaultLiquidator[];
  private notionalContract: Contract;

  constructor(
    public provider: ethers.providers.Provider,
    public settings: LiquidatorSettings
  ) {
    this.liquidatorContracts = this.settings.flashLiquidatorAddress.map(
      (a) =>
        new ethers.Contract(
          a,
          VaultLiquidatorABI,
          this.provider
        ) as VaultLiquidator
    );

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

    const config = results['config'] as Awaited<
      ReturnType<NotionalV3['getVaultConfig']>
    >;
    const borrowToken = results['currency'] as Awaited<
      ReturnType<NotionalV3['getCurrency']>
    >;

    return {
      config,
      borrowToken,
      currencyId: config.borrowCurrencyId,
      currencyIndex: 0,
      assetAddress:
        // Rewrite the asset address to WETH for flash borrowing
        borrowToken.underlyingToken.tokenAddress === ZERO_ADDRESS
          ? WETHAddress[this.settings.network]
          : borrowToken.underlyingToken.tokenAddress,
      assetPrecision: borrowToken.underlyingToken.decimals,
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
          key: `${account_id}:${vault_id}:account`,
        },
      ];
    });
  }

  public async getRiskyAccounts(
    accounts: { account_id: string; vault_id: string }[],
    logger: Logger
  ) {
    const { results } = await aggregate(
      this.getAccountHealthCalls(accounts),
      this.provider,
      undefined,
      true // Allow failure
    );

    const failedRequests = accounts.filter(
      ({ account_id, vault_id }) =>
        results[`${account_id}:${vault_id}:health`.toLowerCase()] === undefined
    );
    for (const f of failedRequests) {
      logger.submitEvent({
        aggregation_key: 'AccountRiskFailure',
        alert_type: 'error',
        host: 'cloudflare',
        network: this.settings.network,
        title: `Failed Vault Account Health Factors`,
        tags: [`event:failed_vault_account_health`, `vault:${f.vault_id}`],
        text: `Failed to get vault health for ${f.account_id} in vault ${
          f.vault_id
        } at block: ${(await this.provider.getBlock('latest')).number}`,
      });
    }

    return accounts
      .filter(
        ({ account_id, vault_id }) =>
          // Exclude failed requests from this list
          !failedRequests.find(
            (f) => f.account_id === account_id && f.vault_id === vault_id
          )
      )
      .map(({ account_id, vault_id }) => {
        const accountHealth = results[
          `${account_id}:${vault_id}:health`.toLowerCase()
        ] as {
          collateralRatio: BigNumber;
          maxLiquidatorDepositUnderlying: [BigNumber, BigNumber, BigNumber];
          vaultSharesToLiquidator: [BigNumber, BigNumber, BigNumber];
        };
        const acct = results[
          `${account_id}:${vault_id}:account`.toLowerCase()
        ] as Awaited<ReturnType<NotionalV3['getVaultAccount']>>;

        return {
          id: account_id,
          maturity: acct.maturity.toNumber(),
          debtUnderlying: acct.accountDebtUnderlying,
          vaultShares: acct.vaultShares,
          vault: vault_id,
          collateralRatio: accountHealth.collateralRatio,
          maxLiquidatorDepositUnderlying:
            accountHealth.maxLiquidatorDepositUnderlying,
          cashBalance: acct.tempCashBalance,
          vaultSharesToLiquidator: accountHealth.vaultSharesToLiquidator,
          canLiquidate: accountHealth.maxLiquidatorDepositUnderlying[0].gt(
            BigNumber.from(0)
          ),
        } as RiskyAccount;
      });
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

  private async getPendlePTRedeemData(
    vault: string,
    maturity: number,
    totalVaultShares: BigNumber
  ) {
    // If no default dex parameters are set then we can skip the redeem data
    if (VaultDefaultDexParameters[this.settings.network][vault] === undefined) {
      return '0x';
    }

    const { dexId, exchangeData } =
      VaultDefaultDexParameters[this.settings.network][vault];

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
      ],
      this.provider
    );

    const minPurchaseAmount = (results['vaultShareValue'] as BigNumber)
      .mul(this.settings.slippageLimit)
      .div(1000);

    return ethers.utils.defaultAbiCoder.encode(
      ['tuple(uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData) r'],
      [
        {
          dexId,
          minPurchaseAmount,
          exchangeData,
        },
      ]
    );
  }

  public async batchMaturityLiquidations(vault: string, accts: RiskyAccount[]) {
    const groupedByMaturity = groupArrayToMap(
      accts.filter((_, index) => index < this.settings.maxLiquidationsPerBatch),
      (t) => t.maturity
    );

    const batches: {
      txn: PopulatedTransaction;
      args: Awaited<
        ReturnType<VaultV3Liquidator['getLiquidateCallData']>
      >['args'];
    }[] = [];
    const batchAccounts: string[] = [];
    for (const maturity of groupedByMaturity.keys()) {
      const accts = groupedByMaturity.get(maturity) || [];

      if (accts.length > 0) {
        const { accounts, batchCalldata, args } =
          await this.getLiquidateCallData(
            vault,
            maturity,
            accts,
            batches.length
          );
        batches.push({
          txn: batchCalldata,
          args,
        });
        batchAccounts.push(...accounts);
      }
    }

    return { batches, batchAccounts };
  }

  public async getLiquidateCallData(
    vault: string,
    maturity: number,
    accts: RiskyAccount[],
    liquidatorIndex: number
  ) {
    const { currencyId, currencyIndex, assetAddress, assetPrecision } =
      await this.getVaultConfig(vault);
    const { flashLoanAmount, redeemData } = await this.getBatchParams(
      vault,
      maturity,
      accts,
      assetPrecision
    );

    const accounts = accts.map((a) => a.id);
    const args = {
      asset: assetAddress,
      amount: flashLoanAmount,
      params: {
        liquidationType: LiquidationType.DELEVERAGE_VAULT_ACCOUNT,
        currencyId,
        currencyIndex,
        accounts,
        vault,
        redeemData,
      },
    };

    const flashLender = getFlashLender({
      network: this.settings.network,
      vault,
      token: args.asset,
    });
    // Must use multiple contracts in a batch liquidation due to vault exit time
    // restrictions.
    const batchCalldata = await this.liquidatorContracts[
      liquidatorIndex
    ].populateTransaction.flashLiquidate(
      flashLender,
      args.asset,
      args.amount,
      args.params
    );

    return { accounts, batchCalldata, args };
  }

  private async getBatchParams(
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
    const vaultType = getVaultType(vault, this.settings.network);
    let redeemData: string;
    if (vaultType === 'PendlePT') {
      redeemData = await this.getPendlePTRedeemData(
        vault,
        maturity,
        totalVaultShares
      );
    } else if (
      vaultType === 'SingleSidedLP' ||
      vaultType === 'SingleSidedLP_VaultRewarderLib'
    ) {
      redeemData = await this.getSingleSidedLPRedeemData(
        vault,
        maturity,
        totalVaultShares
      );
    }

    return {
      flashLoanAmount: totalFlashLoan
        .mul(assetPrecision)
        .mul(this.settings.flashLoanBuffer)
        .div(INTERNAL_TOKEN_PRECISION)
        .div(1000),
      redeemData,
    };
  }

  async liquidateViaMulticall(
    _batch: Awaited<
      ReturnType<typeof this.batchMaturityLiquidations>
    >['batches']
  ) {
    const failingTxns: Awaited<
      ReturnType<typeof this.batchMaturityLiquidations>
    >['batches'] = [];

    // Test each transaction to see if it will fail, and filter out the null txns
    const batch = (
      await Promise.all(
        _batch.map((p) =>
          this.provider
            .estimateGas(p.txn)
            .catch(() => {
              failingTxns.push(p);
              return null;
            })
            .then(() => p)
        )
      )
    )
      // Exclude any failing txns in here
      .filter((b) => !failingTxns.find(({ txn }) => txn.data === b.txn.data));

    const multicall = getMulticall(this.provider);
    const pop = await multicall.populateTransaction.aggregate3(
      batch.map((p) => ({
        target: p.txn.to,
        allowFailure: true,
        callData: p.txn.data,
      }))
    );
    const gasLimit = await multicall.estimateGas.aggregate3(
      batch.map((p) => ({
        target: p.txn.to,
        allowFailure: true,
        callData: p.txn.data,
      }))
    );

    let resp: ethers.providers.TransactionResponse | undefined = undefined;
    if (batch.length > 0) {
      resp = await sendTxThroughRelayer({
        env: {
          NETWORK: this.settings.network,
          TX_RELAY_AUTH_TOKEN: this.settings.txRelayAuthToken,
        },
        to: multicall.address,
        data: pop.data,
        gasLimit: gasLimit.mul(200).div(100).toNumber(),
      });
    }

    return { resp, batch, failingTxns };
  }
}
