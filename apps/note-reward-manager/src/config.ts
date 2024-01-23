import * as addrs from "./config/addresses.json";

export default class Config {
  public static readonly TREASURY_REINVESTMENT_INTERVAL = 3600 * 24 * 7; // 1 week
  public static readonly TREASURY_SELL_AMOUNT = "65000000000000000000"; // 65 COMP

  public static getTreasuryAddress(network: string) {
    return addrs[network]["treasury"]["address"];
  }

  public static getTokenAddress(network: string, token: string) {
    return addrs[network]["tokens"][token];
  }
}
