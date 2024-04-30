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
} from '@notional-finance/util';
import { overrides } from '.';

export type LiquidatorSettings = {
  network: Network;
  vaultAddrs: string[];
  flashLiquidatorAddress: string;
  flashLiquidatorOwner: string;
  flashLenderAddress: string;
  slippageLimit: BigNumber;
  notionalAddress: string;
  flashLoanBuffer: BigNumber;
  txRelayUrl: string;
  txRelayAuthToken: string;
};

enum LiquidationType {
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
    public settings: LiquidatorSettings
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
      assetAddress: (overrides[this.settings.network][
        borrowToken.underlyingToken.tokenAddress
      ] || borrowToken.underlyingToken.tokenAddress) as string,
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
    accounts: { account_id: string; vault_id: string }[]
  ) {
    const { results } = await aggregate(
      this.getAccountHealthCalls(accounts),
      this.provider
    );

    return accounts.map(({ account_id, vault_id }) => {
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

  public async batchMaturityLiquidations(vault: string, accts: RiskyAccount[]) {
    const groupedByMaturity = groupArrayToMap(accts, (t) => t.maturity);

    const batches: PopulatedTransaction[] = [];
    const batchArgs: Awaited<
      ReturnType<VaultV3Liquidator['getLiquidateCallData']>
    >['args'][] = [];
    const batchAccounts: string[] = [];
    for (const maturity of groupedByMaturity.keys()) {
      const accts = groupedByMaturity.get(maturity) || [];

      if (accts.length > 0) {
        const { accounts, batchCalldata, args } =
          await this.getLiquidateCallData(vault, maturity, accts);
        batches.push(batchCalldata);
        batchAccounts.push(...accounts);
        batchArgs.push(args);
      }
    }

    return { batches, batchAccounts, batchArgs };
  }

  public async getLiquidateCallData(
    vault: string,
    maturity: number,
    accts: RiskyAccount[]
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
    const batchCalldata =
      await this.liquidatorContract.populateTransaction.flashLiquidate(
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
    const redeemData = await this.getSingleSidedLPRedeemData(
      vault,
      maturity,
      totalVaultShares
    );

    return {
      flashLoanAmount: totalFlashLoan
        .mul(assetPrecision)
        .mul(this.settings.flashLoanBuffer)
        .div(INTERNAL_TOKEN_PRECISION)
        .div(1000),
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
