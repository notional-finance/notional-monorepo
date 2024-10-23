import { ClientRegistry } from './client-registry';
import { CacheSchema, OracleDefinition } from '../Definitions';
import {
  INTERNAL_TOKEN_PRECISION,
  Network,
  SECONDS_IN_DAY,
  SupportedNetworks,
  ZERO_ADDRESS,
  formatNumberAsPercent,
  getNowSeconds,
  sNOTE,
} from '@notional-finance/util';
import { Registry } from '../Registry';
import { BigNumber } from 'ethers';
import { TokenBalance } from '../token-balance';

export class NOTERegistryClient extends ClientRegistry<Record<string, never>> {
  protected cachePath() {
    return 'note';
  }
  public static sNOTE_Pool = '0x5122E01D819E58BB2E22528c0D68D310f0AA6FD7';

  public static sNOTEOracle = `${ZERO_ADDRESS}:${sNOTE}:sNOTEToETHExchangeRate`;
  REDEEM_WINDOW_SECONDS = 3 * SECONDS_IN_DAY;

  constructor(cacheHostname: string) {
    super(cacheHostname);
    Registry.getExchangeRegistry().onSubjectKeyRegistered(
      Network.mainnet,
      NOTERegistryClient.sNOTE_Pool,
      () => {
        Registry.getExchangeRegistry()
          .subscribeSubject(Network.mainnet, NOTERegistryClient.sNOTE_Pool)
          ?.subscribe(() => {
            const oracles = Registry.getOracleRegistry();
            const pool = Registry.getExchangeRegistry().getSNOTEPool();
            if (oracles.isNetworkRegistered(Network.mainnet) && pool) {
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

  async getSNOTEReinvestmentData() {
    try {
      const resp = await this._fetch<{
        result: {
          rows: {
            day: string;
            evt_block_time: string;
            bpts_per_snote: number;
            eth_reinvestment: number;
            note_reinvestment: number;
            transaction_hash: string;
            apy: number;
          }[];
        };
      }>(Network.mainnet, 'sNOTEReinvestment');
      return resp['result']['rows'].map((r) => ({
        ...r,
        eth_reinvestment: r.eth_reinvestment.toFixed(4),
        apy: formatNumberAsPercent(r.apy, 2),
        day: new Date(r.evt_block_time).getTime() / 1000,
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
