import { BigNumber } from "ethers";
import { Network } from "./types";

const e = (decimals: number) => BigNumber.from(10).pow(decimals);
const e18 = e(18);


export class Oracle {
  #network: Network

  constructor(network: Network) {
    this.#network = network;
  }

  async #defiLlamaGetPrice(token: string, timestamp: number) {
    const network = this.#network === Network.mainnet ? 'ethereum' : this.#network;
    const coin = `${network}:${token}`;
    const result = await fetch(`https://coins.llama.fi/prices/historical/${timestamp}/${coin}`).then(r => r.json()).then((r: any) => r.coins[coin]);
    return {
      price: BigNumber.from((result.price * 1e15).toFixed(0)),
      decimals: 15,
    }
  }

  async getPrice(baseToken: string, quoteToken: string, timestamp: number) {
    const baseOracle = await this.#defiLlamaGetPrice(baseToken, timestamp);
    const quoteOracle = await this.#defiLlamaGetPrice(quoteToken, timestamp);

    return {
      price: baseOracle.price.mul(e(quoteOracle.decimals)).mul(e18).div(quoteOracle.price.mul(e(baseOracle.decimals))),
      decimals: 18,
    }
  }
}


