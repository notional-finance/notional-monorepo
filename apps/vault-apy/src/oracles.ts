import { BigNumber } from 'ethers';
import { Network } from './types';
import { e18, e } from './util';

export class Oracle {
  #network: Network;
  #timestamp: number;

  constructor(network: Network, timestamp: number) {
    this.#network = network;
    this.#timestamp = timestamp;
  }

  async defiLlamaGetPrice(token: string) {
    const network =
      this.#network === Network.mainnet ? 'ethereum' : this.#network;
    const coin = `${network}:${token}`;

    const result = await fetch(
      `https://coins.llama.fi/prices/historical/${this.#timestamp}/${coin}`
    )
      .then((r) => r.json())
      .then((r) => r.coins[coin]);

    return {
      price: BigNumber.from((result.price * 1e15).toFixed(0)),
      decimals: 15,
    };
  }

  async getPrice(baseToken: string, quoteToken: string) {
    const baseOracle = await this.defiLlamaGetPrice(baseToken);
    const quoteOracle = await this.defiLlamaGetPrice(quoteToken);

    return {
      price: baseOracle.price
        .mul(e(quoteOracle.decimals))
        .mul(e18)
        .div(quoteOracle.price.mul(e(baseOracle.decimals))),
      decimals: 18,
    };
  }
}
