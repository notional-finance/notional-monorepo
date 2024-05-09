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

const sNOTE = '0x38de42f4ba8a35056b33a746a6b45be9b1c3b9d2';
const sNOTE_Pool = '0x5122e01d819e58bb2e22528c0d68d310f0aa6fd7';
const sNOTE_Gauge = '0x09afec27f5a6201617aad014ceea8deb572b0608';

interface NOTEParams {
  totalBPTHeld: TokenBalance;
  coolDownTimeInSeconds: number;
  totalSNOTESupply: TokenBalance;
}

export class NOTERegistryClient extends ClientRegistry<NOTEParams> {
  protected cachePath() {
    return 'note';
  }

  public sNOTEOracle = `${ZERO_ADDRESS}:${sNOTE}:sNOTEToETHExchangeRate`;
  REDEEM_WINDOW_SECONDS = 3 * SECONDS_IN_DAY;

  constructor(cacheHostname: string) {
    super(cacheHostname);
    Registry.getTokenRegistry().onNetworkRegistered(Network.mainnet, () => {
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
              console.log('CLAIM START');
              const sNOTEToken = Registry.getTokenRegistry().getTokenByID(
                Network.mainnet,
                sNOTE
              );
              const ETH = Registry.getTokenRegistry().getTokenBySymbol(
                Network.mainnet,
                'ETH'
              );

              // From here we will have the sNOTE pool so we can start to update...
              const claims = this.getSNOTEClaim(TokenBalance.unit(sNOTEToken));
              if (!claims) {
                console.log('ERROR NO CLAIMS');
                return;
              }
              console.log('GOT CLAIMS');
              const [ethClaim, noteClaim] = claims;

              const currentSNOTEPrice = ethClaim
                .add(noteClaim.toToken(ETH))
                .scaleTo(RATE_DECIMALS);

              const oracle: OracleDefinition = {
                id: this.sNOTEOracle,
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
    const sNOTE_Gauge_Contract = new Contract(
      sNOTE_Gauge,
      ERC20ABI,
      getProviderFromNetwork(Network.mainnet)
    );

    return new Promise((resolve) => {
      Registry.getTokenRegistry().onNetworkRegistered(Network.mainnet, () => {
        console.log('CLAIM INIT FETCH');
        fetchUsingMulticall(
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
              // All BPTs are held in the gauge
              target: sNOTE_Gauge_Contract,
              method: 'balanceOf',
              args: [sNOTE],
              key: 'totalBPTHeld',
              transform: (r) =>
                TokenBalance.fromID(r, sNOTE_Pool, Network.mainnet),
            },
          ],
          [
            (r: Record<string, unknown>) => ({
              [sNOTE]: r as unknown as NOTEParams,
            }),
          ]
        ).then(resolve);
      });
    });
  }

  getSNOTEClaim(snote: TokenBalance) {
    if (this.isKeyRegistered(Network.mainnet, sNOTE)) {
      const result = this.getLatestFromSubject(Network.mainnet, sNOTE, 0);
      if (!result) throw Error('No data');
      const bptClaim = result?.totalBPTHeld.scale(
        snote,
        result.totalSNOTESupply
      );
      const pool =
        Registry.getExchangeRegistry().getPoolInstance<SNOTEWeightedPool>(
          Network.mainnet,
          sNOTE_Pool
        );
      return pool.getLPTokenClaims(bptClaim);
    }

    return undefined;
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
