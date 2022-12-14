/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export type TradeStruct = {
  tradeType: PromiseOrValue<BigNumberish>;
  sellToken: PromiseOrValue<string>;
  buyToken: PromiseOrValue<string>;
  amount: PromiseOrValue<BigNumberish>;
  limit: PromiseOrValue<BigNumberish>;
  deadline: PromiseOrValue<BigNumberish>;
  exchangeData: PromiseOrValue<BytesLike>;
};

export type TradeStructOutput = [
  number,
  string,
  string,
  BigNumber,
  BigNumber,
  BigNumber,
  string
] & {
  tradeType: number;
  sellToken: string;
  buyToken: string;
  amount: BigNumber;
  limit: BigNumber;
  deadline: BigNumber;
  exchangeData: string;
};

export declare namespace ITradingModule {
  export type TokenPermissionsStruct = {
    allowSell: PromiseOrValue<boolean>;
    dexFlags: PromiseOrValue<BigNumberish>;
    tradeTypeFlags: PromiseOrValue<BigNumberish>;
  };

  export type TokenPermissionsStructOutput = [boolean, number, number] & {
    allowSell: boolean;
    dexFlags: number;
    tradeTypeFlags: number;
  };
}

export interface TradingModuleInterface extends utils.Interface {
  functions: {
    "NOTIONAL()": FunctionFragment;
    "canExecuteTrade(address,uint16,(uint8,address,address,uint256,uint256,uint256,bytes))": FunctionFragment;
    "executeTrade(uint16,(uint8,address,address,uint256,uint256,uint256,bytes))": FunctionFragment;
    "executeTradeWithDynamicSlippage(uint16,(uint8,address,address,uint256,uint256,uint256,bytes),uint32)": FunctionFragment;
    "getExecutionData(uint16,address,(uint8,address,address,uint256,uint256,uint256,bytes))": FunctionFragment;
    "getLimitAmount(uint8,address,address,uint256,uint32)": FunctionFragment;
    "getOraclePrice(address,address)": FunctionFragment;
    "initialize(uint32)": FunctionFragment;
    "maxOracleFreshnessInSeconds()": FunctionFragment;
    "priceOracles(address)": FunctionFragment;
    "proxiableUUID()": FunctionFragment;
    "setMaxOracleFreshness(uint32)": FunctionFragment;
    "setPriceOracle(address,address)": FunctionFragment;
    "setTokenPermissions(address,address,(bool,uint32,uint32))": FunctionFragment;
    "tokenWhitelist(address,address)": FunctionFragment;
    "upgradeTo(address)": FunctionFragment;
    "upgradeToAndCall(address,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "NOTIONAL"
      | "canExecuteTrade"
      | "executeTrade"
      | "executeTradeWithDynamicSlippage"
      | "getExecutionData"
      | "getLimitAmount"
      | "getOraclePrice"
      | "initialize"
      | "maxOracleFreshnessInSeconds"
      | "priceOracles"
      | "proxiableUUID"
      | "setMaxOracleFreshness"
      | "setPriceOracle"
      | "setTokenPermissions"
      | "tokenWhitelist"
      | "upgradeTo"
      | "upgradeToAndCall"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "NOTIONAL", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "canExecuteTrade",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>, TradeStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "executeTrade",
    values: [PromiseOrValue<BigNumberish>, TradeStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "executeTradeWithDynamicSlippage",
    values: [
      PromiseOrValue<BigNumberish>,
      TradeStruct,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getExecutionData",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>, TradeStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getLimitAmount",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getOraclePrice",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "maxOracleFreshnessInSeconds",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "priceOracles",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "proxiableUUID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setMaxOracleFreshness",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setPriceOracle",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setTokenPermissions",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      ITradingModule.TokenPermissionsStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenWhitelist",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeTo",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCall",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;

  decodeFunctionResult(functionFragment: "NOTIONAL", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "canExecuteTrade",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeTrade",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeTradeWithDynamicSlippage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getExecutionData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLimitAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOraclePrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "maxOracleFreshnessInSeconds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "priceOracles",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "proxiableUUID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMaxOracleFreshness",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPriceOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setTokenPermissions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "upgradeTo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToAndCall",
    data: BytesLike
  ): Result;

  events: {
    "AdminChanged(address,address)": EventFragment;
    "BeaconUpgraded(address)": EventFragment;
    "Initialized(uint8)": EventFragment;
    "MaxOracleFreshnessUpdated(uint32,uint32)": EventFragment;
    "PriceOracleUpdated(address,address)": EventFragment;
    "TokenPermissionsUpdated(address,address,tuple)": EventFragment;
    "TradeExecuted(address,address,uint256,uint256)": EventFragment;
    "Upgraded(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AdminChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BeaconUpgraded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MaxOracleFreshnessUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PriceOracleUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TokenPermissionsUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TradeExecuted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Upgraded"): EventFragment;
}

export interface AdminChangedEventObject {
  previousAdmin: string;
  newAdmin: string;
}
export type AdminChangedEvent = TypedEvent<
  [string, string],
  AdminChangedEventObject
>;

export type AdminChangedEventFilter = TypedEventFilter<AdminChangedEvent>;

export interface BeaconUpgradedEventObject {
  beacon: string;
}
export type BeaconUpgradedEvent = TypedEvent<
  [string],
  BeaconUpgradedEventObject
>;

export type BeaconUpgradedEventFilter = TypedEventFilter<BeaconUpgradedEvent>;

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface MaxOracleFreshnessUpdatedEventObject {
  currentValue: number;
  newValue: number;
}
export type MaxOracleFreshnessUpdatedEvent = TypedEvent<
  [number, number],
  MaxOracleFreshnessUpdatedEventObject
>;

export type MaxOracleFreshnessUpdatedEventFilter =
  TypedEventFilter<MaxOracleFreshnessUpdatedEvent>;

export interface PriceOracleUpdatedEventObject {
  token: string;
  oracle: string;
}
export type PriceOracleUpdatedEvent = TypedEvent<
  [string, string],
  PriceOracleUpdatedEventObject
>;

export type PriceOracleUpdatedEventFilter =
  TypedEventFilter<PriceOracleUpdatedEvent>;

export interface TokenPermissionsUpdatedEventObject {
  sender: string;
  token: string;
  permissions: ITradingModule.TokenPermissionsStructOutput;
}
export type TokenPermissionsUpdatedEvent = TypedEvent<
  [string, string, ITradingModule.TokenPermissionsStructOutput],
  TokenPermissionsUpdatedEventObject
>;

export type TokenPermissionsUpdatedEventFilter =
  TypedEventFilter<TokenPermissionsUpdatedEvent>;

export interface TradeExecutedEventObject {
  sellToken: string;
  buyToken: string;
  sellAmount: BigNumber;
  buyAmount: BigNumber;
}
export type TradeExecutedEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  TradeExecutedEventObject
>;

export type TradeExecutedEventFilter = TypedEventFilter<TradeExecutedEvent>;

export interface UpgradedEventObject {
  implementation: string;
}
export type UpgradedEvent = TypedEvent<[string], UpgradedEventObject>;

export type UpgradedEventFilter = TypedEventFilter<UpgradedEvent>;

export interface TradingModule extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: TradingModuleInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    NOTIONAL(overrides?: CallOverrides): Promise<[string]>;

    canExecuteTrade(
      from: PromiseOrValue<string>,
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    executeTrade(
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    executeTradeWithDynamicSlippage(
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      dynamicSlippageLimit: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getExecutionData(
      dexId: PromiseOrValue<BigNumberish>,
      from: PromiseOrValue<string>,
      trade: TradeStruct,
      overrides?: CallOverrides
    ): Promise<
      [string, string, BigNumber, string] & {
        spender: string;
        target: string;
        msgValue: BigNumber;
        executionCallData: string;
      }
    >;

    getLimitAmount(
      tradeType: PromiseOrValue<BigNumberish>,
      sellToken: PromiseOrValue<string>,
      buyToken: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      slippageLimit: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { limitAmount: BigNumber }>;

    getOraclePrice(
      baseToken: PromiseOrValue<string>,
      quoteToken: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { answer: BigNumber; decimals: BigNumber }
    >;

    initialize(
      maxOracleFreshnessInSeconds_: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    maxOracleFreshnessInSeconds(overrides?: CallOverrides): Promise<[number]>;

    priceOracles(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string, number] & { oracle: string; rateDecimals: number }>;

    proxiableUUID(overrides?: CallOverrides): Promise<[string]>;

    setMaxOracleFreshness(
      newMaxOracleFreshnessInSeconds: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setPriceOracle(
      token: PromiseOrValue<string>,
      oracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setTokenPermissions(
      sender: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      permissions: ITradingModule.TokenPermissionsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    tokenWhitelist(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [boolean, number, number] & {
        allowSell: boolean;
        dexFlags: number;
        tradeTypeFlags: number;
      }
    >;

    upgradeTo(
      newImplementation: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    upgradeToAndCall(
      newImplementation: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  NOTIONAL(overrides?: CallOverrides): Promise<string>;

  canExecuteTrade(
    from: PromiseOrValue<string>,
    dexId: PromiseOrValue<BigNumberish>,
    trade: TradeStruct,
    overrides?: CallOverrides
  ): Promise<boolean>;

  executeTrade(
    dexId: PromiseOrValue<BigNumberish>,
    trade: TradeStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  executeTradeWithDynamicSlippage(
    dexId: PromiseOrValue<BigNumberish>,
    trade: TradeStruct,
    dynamicSlippageLimit: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getExecutionData(
    dexId: PromiseOrValue<BigNumberish>,
    from: PromiseOrValue<string>,
    trade: TradeStruct,
    overrides?: CallOverrides
  ): Promise<
    [string, string, BigNumber, string] & {
      spender: string;
      target: string;
      msgValue: BigNumber;
      executionCallData: string;
    }
  >;

  getLimitAmount(
    tradeType: PromiseOrValue<BigNumberish>,
    sellToken: PromiseOrValue<string>,
    buyToken: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    slippageLimit: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getOraclePrice(
    baseToken: PromiseOrValue<string>,
    quoteToken: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { answer: BigNumber; decimals: BigNumber }
  >;

  initialize(
    maxOracleFreshnessInSeconds_: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  maxOracleFreshnessInSeconds(overrides?: CallOverrides): Promise<number>;

  priceOracles(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<[string, number] & { oracle: string; rateDecimals: number }>;

  proxiableUUID(overrides?: CallOverrides): Promise<string>;

  setMaxOracleFreshness(
    newMaxOracleFreshnessInSeconds: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setPriceOracle(
    token: PromiseOrValue<string>,
    oracle: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setTokenPermissions(
    sender: PromiseOrValue<string>,
    token: PromiseOrValue<string>,
    permissions: ITradingModule.TokenPermissionsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  tokenWhitelist(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<
    [boolean, number, number] & {
      allowSell: boolean;
      dexFlags: number;
      tradeTypeFlags: number;
    }
  >;

  upgradeTo(
    newImplementation: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  upgradeToAndCall(
    newImplementation: PromiseOrValue<string>,
    data: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    NOTIONAL(overrides?: CallOverrides): Promise<string>;

    canExecuteTrade(
      from: PromiseOrValue<string>,
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      overrides?: CallOverrides
    ): Promise<boolean>;

    executeTrade(
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        amountSold: BigNumber;
        amountBought: BigNumber;
      }
    >;

    executeTradeWithDynamicSlippage(
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      dynamicSlippageLimit: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        amountSold: BigNumber;
        amountBought: BigNumber;
      }
    >;

    getExecutionData(
      dexId: PromiseOrValue<BigNumberish>,
      from: PromiseOrValue<string>,
      trade: TradeStruct,
      overrides?: CallOverrides
    ): Promise<
      [string, string, BigNumber, string] & {
        spender: string;
        target: string;
        msgValue: BigNumber;
        executionCallData: string;
      }
    >;

    getLimitAmount(
      tradeType: PromiseOrValue<BigNumberish>,
      sellToken: PromiseOrValue<string>,
      buyToken: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      slippageLimit: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOraclePrice(
      baseToken: PromiseOrValue<string>,
      quoteToken: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { answer: BigNumber; decimals: BigNumber }
    >;

    initialize(
      maxOracleFreshnessInSeconds_: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    maxOracleFreshnessInSeconds(overrides?: CallOverrides): Promise<number>;

    priceOracles(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string, number] & { oracle: string; rateDecimals: number }>;

    proxiableUUID(overrides?: CallOverrides): Promise<string>;

    setMaxOracleFreshness(
      newMaxOracleFreshnessInSeconds: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setPriceOracle(
      token: PromiseOrValue<string>,
      oracle: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setTokenPermissions(
      sender: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      permissions: ITradingModule.TokenPermissionsStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    tokenWhitelist(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [boolean, number, number] & {
        allowSell: boolean;
        dexFlags: number;
        tradeTypeFlags: number;
      }
    >;

    upgradeTo(
      newImplementation: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    upgradeToAndCall(
      newImplementation: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "AdminChanged(address,address)"(
      previousAdmin?: null,
      newAdmin?: null
    ): AdminChangedEventFilter;
    AdminChanged(
      previousAdmin?: null,
      newAdmin?: null
    ): AdminChangedEventFilter;

    "BeaconUpgraded(address)"(
      beacon?: PromiseOrValue<string> | null
    ): BeaconUpgradedEventFilter;
    BeaconUpgraded(
      beacon?: PromiseOrValue<string> | null
    ): BeaconUpgradedEventFilter;

    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "MaxOracleFreshnessUpdated(uint32,uint32)"(
      currentValue?: null,
      newValue?: null
    ): MaxOracleFreshnessUpdatedEventFilter;
    MaxOracleFreshnessUpdated(
      currentValue?: null,
      newValue?: null
    ): MaxOracleFreshnessUpdatedEventFilter;

    "PriceOracleUpdated(address,address)"(
      token?: null,
      oracle?: null
    ): PriceOracleUpdatedEventFilter;
    PriceOracleUpdated(
      token?: null,
      oracle?: null
    ): PriceOracleUpdatedEventFilter;

    "TokenPermissionsUpdated(address,address,tuple)"(
      sender?: null,
      token?: null,
      permissions?: null
    ): TokenPermissionsUpdatedEventFilter;
    TokenPermissionsUpdated(
      sender?: null,
      token?: null,
      permissions?: null
    ): TokenPermissionsUpdatedEventFilter;

    "TradeExecuted(address,address,uint256,uint256)"(
      sellToken?: PromiseOrValue<string> | null,
      buyToken?: PromiseOrValue<string> | null,
      sellAmount?: null,
      buyAmount?: null
    ): TradeExecutedEventFilter;
    TradeExecuted(
      sellToken?: PromiseOrValue<string> | null,
      buyToken?: PromiseOrValue<string> | null,
      sellAmount?: null,
      buyAmount?: null
    ): TradeExecutedEventFilter;

    "Upgraded(address)"(
      implementation?: PromiseOrValue<string> | null
    ): UpgradedEventFilter;
    Upgraded(
      implementation?: PromiseOrValue<string> | null
    ): UpgradedEventFilter;
  };

  estimateGas: {
    NOTIONAL(overrides?: CallOverrides): Promise<BigNumber>;

    canExecuteTrade(
      from: PromiseOrValue<string>,
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    executeTrade(
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    executeTradeWithDynamicSlippage(
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      dynamicSlippageLimit: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getExecutionData(
      dexId: PromiseOrValue<BigNumberish>,
      from: PromiseOrValue<string>,
      trade: TradeStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getLimitAmount(
      tradeType: PromiseOrValue<BigNumberish>,
      sellToken: PromiseOrValue<string>,
      buyToken: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      slippageLimit: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOraclePrice(
      baseToken: PromiseOrValue<string>,
      quoteToken: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      maxOracleFreshnessInSeconds_: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    maxOracleFreshnessInSeconds(overrides?: CallOverrides): Promise<BigNumber>;

    priceOracles(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    proxiableUUID(overrides?: CallOverrides): Promise<BigNumber>;

    setMaxOracleFreshness(
      newMaxOracleFreshnessInSeconds: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setPriceOracle(
      token: PromiseOrValue<string>,
      oracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setTokenPermissions(
      sender: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      permissions: ITradingModule.TokenPermissionsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    tokenWhitelist(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    upgradeTo(
      newImplementation: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    upgradeToAndCall(
      newImplementation: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    NOTIONAL(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    canExecuteTrade(
      from: PromiseOrValue<string>,
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    executeTrade(
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    executeTradeWithDynamicSlippage(
      dexId: PromiseOrValue<BigNumberish>,
      trade: TradeStruct,
      dynamicSlippageLimit: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getExecutionData(
      dexId: PromiseOrValue<BigNumberish>,
      from: PromiseOrValue<string>,
      trade: TradeStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getLimitAmount(
      tradeType: PromiseOrValue<BigNumberish>,
      sellToken: PromiseOrValue<string>,
      buyToken: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      slippageLimit: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOraclePrice(
      baseToken: PromiseOrValue<string>,
      quoteToken: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      maxOracleFreshnessInSeconds_: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    maxOracleFreshnessInSeconds(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    priceOracles(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    proxiableUUID(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setMaxOracleFreshness(
      newMaxOracleFreshnessInSeconds: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setPriceOracle(
      token: PromiseOrValue<string>,
      oracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setTokenPermissions(
      sender: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      permissions: ITradingModule.TokenPermissionsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    tokenWhitelist(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    upgradeTo(
      newImplementation: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    upgradeToAndCall(
      newImplementation: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
