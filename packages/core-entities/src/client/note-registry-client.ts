import { ClientRegistry } from './client-registry';
import { CacheSchema, OracleDefinition } from '../Definitions';
import {
  INTERNAL_TOKEN_PRECISION,
  Network,
  SECONDS_IN_DAY,
  SupportedNetworks,
  ZERO_ADDRESS,
  getNowSeconds,
} from '@notional-finance/util';
import { Registry } from '../Registry';
import SNOTEWeightedPool from '../exchanges/BalancerV2/snote-weighted-pool';
import { BigNumber } from 'ethers';
import { TokenBalance } from '../token-balance';

const sNOTE = '0x38de42f4ba8a35056b33a746a6b45be9b1c3b9d2';
const sNOTE_Pool = '0x5122e01d819e58bb2e22528c0d68d310f0aa6fd7';

export class NOTERegistryClient extends ClientRegistry<Record<string, never>> {
  protected cachePath() {
    return 'note';
  }

  public static sNOTEOracle = `${ZERO_ADDRESS}:${sNOTE}:sNOTEToETHExchangeRate`;
  REDEEM_WINDOW_SECONDS = 3 * SECONDS_IN_DAY;

  constructor(cacheHostname: string) {
    super(cacheHostname);
    Registry.getExchangeRegistry().onSubjectKeyRegistered(
      Network.mainnet,
      sNOTE_Pool,
      () => {
        Registry.getExchangeRegistry()
          .subscribeSubject(Network.mainnet, sNOTE_Pool)
          ?.subscribe(() => {
            const oracles = Registry.getOracleRegistry();
            if (oracles.isNetworkRegistered(Network.mainnet)) {
              const pool =
                Registry.getExchangeRegistry().getPoolInstance<SNOTEWeightedPool>(
                  Network.mainnet,
                  sNOTE_Pool
                );

              const currentSNOTEPrice = pool.getCurrentSNOTEPrice();

              const oracle: OracleDefinition = {
                id: NOTERegistryClient.sNOTEOracle,
                oracleAddress: sNOTE,
                network: Network.mainnet,
                oracleType: 'sNOTEToETHExchangeRate',
                base: ZERO_ADDRESS,
                quote: sNOTE,
                decimals: currentSNOTEPrice.decimals,
                latestRate: {
                  blockNumber: 0,
                  timestamp: getNowSeconds(),
                  rate: currentSNOTEPrice.n,
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
  ): Promise<CacheSchema<Record<string, never>>> {
    return {
      values: [],
      network,
      lastUpdateTimestamp: getNowSeconds(),
      lastUpdateBlock: 0,
    };
  }

  getTotalAnnualEmission() {
    const config = Registry.getConfigurationRegistry();
    const totalEmissions = SupportedNetworks.reduce((total, n) => {
      return total.add(
        config
          .getAllListedCurrencies(n)
          ?.reduce(
            (s, c) =>
              c.incentives?.incentiveEmissionRate
                ? s.add(c.incentives.incentiveEmissionRate)
                : s,
            BigNumber.from(0)
          ) || BigNumber.from(0)
      );
    }, BigNumber.from(0));

    return TokenBalance.fromSymbol(
      totalEmissions.mul(INTERNAL_TOKEN_PRECISION),
      'NOTE',
      Network.mainnet
    );
  }

  async getNOTESupplyData() {
    try {
      const resp = await this._fetch<{
        result: {
          rows: {
            address: 'Burned' | 'Circulating Supply' | 'Non-Circulating';
            balance: number;
            day: string;
          }[];
        };
      }>(Network.mainnet, 'NOTESupply');
      return resp['result']['rows'].map((r) => ({
        ...r,
        day: new Date(r.day),
      }));
    } catch {
      return [];
    }
  }

  async getSNOTEData() {
    try {
      const resp = await this._fetch<{
        result: {
          rows: {
            day: string;
            total_pool_value: number;
            snote_supply: number;
            price: number;
            apy: number;
          }[];
        };
      }>(Network.mainnet, 'sNOTEPoolData');
      return resp['result']['rows'].map((r) => ({
        ...r,
        day: new Date(r.day),
      }));
    } catch {
      return [];
    }
  }

  // TODO: put this in yield registry, this is just the most recent value in the APY oracle
  // getCurrentSNOTEYield(snote: TokenBalance) {}
  // getSingleSidedExit(snote: TokenBalance) {}
  // getOptimalEntry(amountIn: TokenBalance) {}
  // getSNOTEGivenEntry(note: TokenBalance, eth: TokenBalance) {}
}
