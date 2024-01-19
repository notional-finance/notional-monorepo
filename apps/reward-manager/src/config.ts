import * as addrs from "./config/addresses.json";
import * as settings from "./config/settings.json";
import { BigNumber } from "ethers";

export enum DexId {
    UNKNOWN,
    UNISWAP_V2,
    UNISWAP_V3,
    ZERO_EX,
    BALANCER_V2,
    CURVE,
    NOTIONAL_VAULT
}
  
export enum TradeType {
    EXACT_IN_SINGLE,
    EXACT_OUT_SINGLE,
    EXACT_IN_BATCH,
    EXACT_OUT_BATCH
}

export default class Config {
    public static readonly AUTOTASK_NAMESPACE = 'reward-manager';
    public static readonly RELAYER_VALID_UNTIL = 3600; // 60 second limit for relayers
    public static readonly RELAYER_VALID_UNTIL_MILLISECONDS =
      this.RELAYER_VALID_UNTIL * 1000;
    public static readonly RELAYER_SPEED = "fastest";
    public static readonly BLOCK_NATIVE_MIN_DELAY = 5000; // BlockNative has a 5-second rate limit
    public static readonly MAX_GAS_PRICE = "90000000000"; // 90 gwei
    public static readonly TREASURY_REINVESTMENT_INTERVAL = 3600 * 24 * 7; // 1 week
    public static readonly TREASURY_SELL_AMOUNT = "65000000000000000000"; // 65 COMP

    public static getChainId(network: string): number {
        if (network === 'kovan') {
            return 42;
        } else if (network === 'goerli') {
            return 5;
        } else if (network === 'mainnet') {
            return 1;
        }
        return 1337;
    }

    public static getTreasuryAddress(network: string) {
        return addrs[network]["treasury"]["address"];
    }

    public static getWstETHVaultAddress(network: string) {
        return addrs[network]["wstETHVault"]["address"];
    }

    public static getTokenAddress(network: string, token: string) {
        return addrs[network]["tokens"][token];
    }

    public static getRewardTokenPoolId(network: string, rewardToken: string) {
        return settings[network]["poolIds"][rewardToken.toLowerCase()];
    }

    public static getReinvestmentThreshold(network: string, rewardToken: string) {
        return BigNumber.from(settings[network]["reinvestThresholds"][rewardToken.toLowerCase()]);
    }

    public static isTestnet(network: string): boolean {
        return network === "kovan" || network === "goerli";
    }
}
