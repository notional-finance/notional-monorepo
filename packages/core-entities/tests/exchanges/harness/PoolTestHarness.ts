import { Network } from '@notional-finance/util';
import { Signer, ethers, Contract } from 'ethers';
import { BaseLiquidityPool } from '../../../src/exchanges';
import { Registry, TokenBalance } from '../../../src';
import { ERC20, ERC20ABI } from '@notional-finance/contracts';

export class UnimplementedPoolMethod extends Error {
  constructor() {
    super('Unimplemented');
    this.name = this.constructor.name;
  }
}

export abstract class PoolTestHarness<T extends BaseLiquidityPool<unknown>> {
  public static async buildPoolHarness<P extends BaseLiquidityPool<unknown>>(
    _network: Network,
    _poolAddress: string,
    _provider: ethers.providers.JsonRpcProvider
  ): Promise<PoolTestHarness<P>> {
    throw Error('Unimplemented');
  }

  public poolInstance: T;

  constructor(
    public network: Network,
    public poolAddress: string,
    public provider: ethers.providers.JsonRpcProvider
  ) {
    this.poolInstance = Registry.getExchangeRegistry().getPoolInstance<T>(
      network,
      poolAddress
    );
  }

  public abstract singleSideEntry(
    signer: Signer,
    entryTokenIndex: number,
    entryTokenAmount: TokenBalance
  ): Promise<{ lpTokens: TokenBalance; feesPaid: TokenBalance[] }>;

  public abstract singleSideExit(
    signer: Signer,
    exitTokenIndex: number,
    lpTokenAmount: TokenBalance
  ): Promise<{ tokensOut: TokenBalance; feesPaid: TokenBalance[] }>;

  public abstract multiTokenEntry(
    signer: Signer,
    tokensIn: TokenBalance[]
  ): Promise<{ lpTokens: TokenBalance; feesPaid: TokenBalance[] }>;

  public abstract multiTokenExit(
    signer: Signer,
    lpTokenAmount: TokenBalance,
    minTokensOut?: TokenBalance[]
  ): Promise<{ tokensOut: TokenBalance[]; feesPaid: TokenBalance[] }>;

  public abstract trade(
    signer: Signer,
    tokensIn: TokenBalance,
    tokenInIndex: number,
    tokenOutIndex: number
  ): Promise<{ tokensOut: TokenBalance; feesPaid: TokenBalance[] }>;

  async balanceOf(signer: Signer): Promise<TokenBalance> {
    const erc20 = new Contract(
      this.poolInstance.oneLPToken().token.address,
      ERC20ABI,
      provider
    ) as ERC20;
    const b = await erc20.balanceOf(await signer.getAddress());
    return this.poolInstance.oneLPToken().copy(b);
  }
}
