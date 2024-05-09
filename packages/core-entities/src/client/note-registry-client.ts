import { ClientRegistry } from './client-registry';
import { CacheSchema, OracleDefinition } from '../Definitions';
import {
  Network,
  RATE_DECIMALS,
  SECONDS_IN_DAY,
  ZERO_ADDRESS,
  getNowSeconds,
  getProviderFromNetwork,
} from '@notional-finance/util';
import { TokenBalance } from '../token-balance';
import { Registry } from '../Registry';
import { fetchUsingMulticall } from '../server/server-registry';
import { Contract } from 'ethers';
import { ERC20ABI, SNOTEABI } from '@notional-finance/contracts';
import SNOTEWeightedPool from '../exchanges/BalancerV2/snote-weighted-pool';

const sNOTE = '0x38DE42F4BA8a35056b33A746A6b45bE9B1c3B9d2';
const sNOTE_Pool = '0x5122E01D819E58BB2E22528c0D68D310f0AA6FD7';

interface NOTEParams {
  totalBPTHeld: TokenBalance;
  coolDownTimeInSeconds: number;
  totalSNOTESupply: TokenBalance;
}

export class NOTERegistryClient extends ClientRegistry<NOTEParams> {
  protected cachePath() {
    return 'note';
  }

  REDEEM_WINDOW_SECONDS = 3 * SECONDS_IN_DAY;

  constructor(cacheHostname: string) {
    super(cacheHostname);
    Registry.getTokenRegistry().registerToken({
      id: sNOTE,
      address: sNOTE,
      network: Network.mainnet,
      name: 'Staked NOTE',
      symbol: 'sNOTE',
      decimals: 18,
      tokenInterface: 'ERC20',
      tokenType: 'Underlying',
      // TODO: maybe we can put this in later?
      totalSupply: undefined,
    });

    Registry.getExchangeRegistry().onSubjectKeyRegistered(
      Network.mainnet,
      sNOTE_Pool,
      () => {
        Registry.getExchangeRegistry()
          .subscribeSubject(Network.mainnet, sNOTE_Pool)
          ?.subscribe(() => {
            const oracles = Registry.getOracleRegistry();
            if (oracles.isNetworkRegistered(Network.mainnet)) {
              const sNOTEToken = Registry.getTokenRegistry().getTokenByID(
                Network.mainnet,
                sNOTE
              );
              const ETH = Registry.getTokenRegistry().getTokenBySymbol(
                Network.mainnet,
                'ETH'
              );

              // From here we will have the sNOTE pool so we can start to update...
              const [noteClaim, ethClaim] = this.getSNOTEClaim(
                TokenBalance.unit(sNOTEToken)
              );

              const currentSNOTEPrice = ethClaim
                .add(noteClaim.toToken(ETH))
                .scaleTo(RATE_DECIMALS);

              const oracle: OracleDefinition = {
                id: `${ZERO_ADDRESS}:${sNOTE}:sNOTEToETHExchangeRate`,
                oracleAddress: sNOTE,
                network: Network.mainnet,
                oracleType: 'sNOTEToETHExchangeRate',
                base: ZERO_ADDRESS,
                quote: sNOTE,
                decimals: RATE_DECIMALS,
                latestRate: {
                  blockNumber: 0,
                  timestamp: getNowSeconds(),
                  rate: currentSNOTEPrice,
                },
              };

              oracles.registerOracle(Network.mainnet, oracle);
            }
          });
      }
    );
  }

  protected override async _refresh(
    network: Network
  ): Promise<CacheSchema<NOTEParams>> {
    const sNOTE_Contract = new Contract(
      sNOTE,
      SNOTEABI,
      getProviderFromNetwork(Network.mainnet)
    );
    const sNOTE_Pool_Contract = new Contract(
      sNOTE_Pool,
      ERC20ABI,
      getProviderFromNetwork(Network.mainnet)
    );

    return fetchUsingMulticall(
      network,
      [
        {
          stage: 0,
          target: sNOTE_Contract,
          method: 'totalSupply',
          key: 'totalSNOTESupply',
          transform: (r) => TokenBalance.fromID(r, sNOTE, Network.mainnet),
        },
        {
          stage: 0,
          target: sNOTE_Contract,
          method: 'coolDownTimeInSeconds',
          key: 'coolDownTimeInSeconds',
        },
        {
          stage: 0,
          target: sNOTE_Pool_Contract,
          method: 'balanceOf',
          args: [sNOTE],
          key: 'totalBPTHeld',
          transform: (r) => TokenBalance.fromID(r, sNOTE_Pool, Network.mainnet),
        },
      ],
      [
        (r: Record<string, unknown>) => ({
          [sNOTE]: r as unknown as NOTEParams,
        }),
      ]
    );
  }

  getSNOTEClaim(snote: TokenBalance) {
    const result = this.getLatestFromSubject(Network.mainnet, sNOTE);
    if (!result) throw Error('No data');
    const bptClaim = result?.totalBPTHeld.scale(snote, result.totalSNOTESupply);
    const pool =
      Registry.getExchangeRegistry().getPoolInstance<SNOTEWeightedPool>(
        Network.mainnet,
        sNOTE_Pool
      );
    return pool.getLPTokenClaims(bptClaim);
  }

  getTotalSNOTE() {
    const result = this.getLatestFromSubject(Network.mainnet, sNOTE);
    return result?.totalSNOTESupply;
  }

  // TODO: put this in yield registry, this is just the most recent value in the APY oracle
  // getCurrentSNOTEYield(snote: TokenBalance) {}
  // getSingleSidedExit(snote: TokenBalance) {}
  // getOptimalEntry(amountIn: TokenBalance) {}
  // getSNOTEGivenEntry(note: TokenBalance, eth: TokenBalance) {}
}
