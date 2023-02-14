import { BalancerPoolHarness } from './harness/BalancerPoolHarness';
import { Network, ExchangeRegistry } from '../../src';
import { BaseLiquidityPool } from '../../src/exchanges';
import { PoolTestHarness } from './harness/PoolTestHarness';
import { Contract, Wallet } from 'ethers';
import { ERC20, ERC20ABI } from '@notional-finance/contracts';

describe.withFork(
  { blockNumber: 16605421, network: 'mainnet' },
  'pool acceptance tests',
  () => {
    // Create matching Pool Harness
    const allPools = ExchangeRegistry.getAllPools(Network.Mainnet);

    const signer = new Wallet(
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      provider
    );

    beforeAll(async () => {
      // Initializes all internal pool data
      await ExchangeRegistry.fetchPoolData(Network.Mainnet, provider);
    });

    describe.each(allPools)('DEX Acceptance Testing', (address) => {
      let harness: PoolTestHarness;
      let basePool: BaseLiquidityPool<unknown>;

      beforeAll(async () => {
        // @todo balancer pool harness needs to change
        harness = await BalancerPoolHarness.makePoolHarness(
          Network.Mainnet,
          address
        );
        const _basePool = ExchangeRegistry.getPoolInstance(
          Network.Mainnet,
          address
        );
        if (!_basePool) throw Error(`Base Pool for ${address} not found`);
        basePool = _basePool;
      });

      it('calculates trades', async () => {
        const tokensIn = basePool.balances[0].copy(
          basePool.balances[0].decimals
        );

        const tokenContract = new Contract(
          tokensIn.token.address,
          ERC20ABI,
          provider
        ) as ERC20;
        const whale = whales.get(tokensIn.token.address);

        if (whale) {
          await tokenContract
            .connect(whale)
            .transfer(signer.address, tokensIn.n.mul(10));
        }

        const { tokensOut, feesPaid } = basePool.calculateTokenTrade(
          tokensIn.mulInRatePrecision(2e9),
          0,
          1
        );

        feesPaid.forEach((f) => console.log(f.toDisplayStringWithSymbol(8)));
        const actual = await harness.trade(signer, tokensIn.n.mul(2), 0, 1);

        console.log(
          tokensOut.ratioWith(tokensOut.copy(actual.tokensOut)).toNumber() / 1e9
        );
        console.log(actual.tokensOut.toString());
      });

      // it.todo('calculates single sided entry');
      // it.todo('calculates single sided exit');
      // it.todo('calculates balanced entry');
      // it.todo('calculates balanced exit');
      // it.todo('calculates unbalanced entry');
      // it.todo('calculates unbalanced exit');
      // it.todo('calculates a price exposure table');
    });
  }
);
