import { BigNumber, providers } from "ethers";
import Config from "./config";

const BN_BASE_URL = "https://api.blocknative.com";

// TODO: use OZ gas oracle if possible
export default class GasOracle {
  private network: string;
  private apiKey: string;
  private provider: providers.Provider;
  private prevTS: number;

  constructor(network: string, apiKey: string, provider: providers.Provider) {
    this.network = network;
    this.apiKey = apiKey;
    this.provider = provider;
    this.prevTS = 0;
  }

  public async getGasPrice(): Promise<BigNumber | null> {
    if (Config.isTestnet(this.network)) {
      try {
        return await this.provider.getGasPrice();
      } catch (e: any) {
        console.error(e.stack);
        return BigNumber.from(0);
      }
    }

    const now = Date.now();
    const diff = now - this.prevTS;
    this.prevTS = now;

    // Make sure we don't call BlockNative too often
    if (diff < Config.BLOCK_NATIVE_MIN_DELAY) {
      console.log(
        `Calling BlockNative too quickly, sleeping for ${Config.BLOCK_NATIVE_MIN_DELAY} ms`
      );
      await new Promise((r) => setTimeout(r, Config.BLOCK_NATIVE_MIN_DELAY));
    }

    try {
      const resp = await fetch(`${BN_BASE_URL}/gasprices/blockprices`, {
        headers: {
          Authorization: this.apiKey,
        },
      });
      const data: any = await resp.json();
      if (data) {
        const prices = data.blockPrices[0].estimatedPrices;
        const found = prices.find((p: any) => p.confidence > 95);
        if (found) {
          return BigNumber.from(found.price.toString()).mul(BigNumber.from(1e9)); // Conver to wei
        }
      }
      return null;
    } catch (e: any) {
      console.error("Error getting gas price");
      console.error(e.stack);
      return null;
    }
  }
}
