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

export interface SecondaryRewarderInterface extends utils.Interface {
  functions: {
    "CURRENCY_ID()": FunctionFragment;
    "NOTIONAL()": FunctionFragment;
    "NTOKEN_ADDRESS()": FunctionFragment;
    "REWARD_TOKEN()": FunctionFragment;
    "REWARD_TOKEN_DECIMALS()": FunctionFragment;
    "accumulatedRewardPerNToken()": FunctionFragment;
    "claimRewards(address,uint16,uint256,uint256,uint256)": FunctionFragment;
    "claimRewardsDirect(address,uint256,bytes32[])": FunctionFragment;
    "detach()": FunctionFragment;
    "detached()": FunctionFragment;
    "emissionRatePerYear()": FunctionFragment;
    "endTime()": FunctionFragment;
    "getAccountRewardClaim(address,uint256,bytes32[])": FunctionFragment;
    "getAccountRewardClaim(address,uint32)": FunctionFragment;
    "lastAccumulatedTime()": FunctionFragment;
    "merkleRoot()": FunctionFragment;
    "recover(address,uint256)": FunctionFragment;
    "rewardDebtPerAccount(address)": FunctionFragment;
    "setIncentiveEmissionRate(uint128,uint32)": FunctionFragment;
    "setMerkleRoot(bytes32)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "CURRENCY_ID"
      | "NOTIONAL"
      | "NTOKEN_ADDRESS"
      | "REWARD_TOKEN"
      | "REWARD_TOKEN_DECIMALS"
      | "accumulatedRewardPerNToken"
      | "claimRewards"
      | "claimRewardsDirect"
      | "detach"
      | "detached"
      | "emissionRatePerYear"
      | "endTime"
      | "getAccountRewardClaim(address,uint256,bytes32[])"
      | "getAccountRewardClaim(address,uint32)"
      | "lastAccumulatedTime"
      | "merkleRoot"
      | "recover"
      | "rewardDebtPerAccount"
      | "setIncentiveEmissionRate"
      | "setMerkleRoot"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "CURRENCY_ID",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "NOTIONAL", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "NTOKEN_ADDRESS",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "REWARD_TOKEN",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "REWARD_TOKEN_DECIMALS",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "accumulatedRewardPerNToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "claimRewards",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "claimRewardsDirect",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>[]
    ]
  ): string;
  encodeFunctionData(functionFragment: "detach", values?: undefined): string;
  encodeFunctionData(functionFragment: "detached", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "emissionRatePerYear",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "endTime", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getAccountRewardClaim(address,uint256,bytes32[])",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getAccountRewardClaim(address,uint32)",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "lastAccumulatedTime",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "merkleRoot",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "recover",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "rewardDebtPerAccount",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setIncentiveEmissionRate",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setMerkleRoot",
    values: [PromiseOrValue<BytesLike>]
  ): string;

  decodeFunctionResult(
    functionFragment: "CURRENCY_ID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "NOTIONAL", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "NTOKEN_ADDRESS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "REWARD_TOKEN",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "REWARD_TOKEN_DECIMALS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "accumulatedRewardPerNToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimRewardsDirect",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "detach", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "detached", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "emissionRatePerYear",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "endTime", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getAccountRewardClaim(address,uint256,bytes32[])",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAccountRewardClaim(address,uint32)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lastAccumulatedTime",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "merkleRoot", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "recover", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "rewardDebtPerAccount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setIncentiveEmissionRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMerkleRoot",
    data: BytesLike
  ): Result;

  events: {
    "RewardEmissionUpdate(uint256,uint256)": EventFragment;
    "RewardTransfer(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "RewardEmissionUpdate"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RewardTransfer"): EventFragment;
}

export interface RewardEmissionUpdateEventObject {
  emissionRatePerYear: BigNumber;
  endTime: BigNumber;
}
export type RewardEmissionUpdateEvent = TypedEvent<
  [BigNumber, BigNumber],
  RewardEmissionUpdateEventObject
>;

export type RewardEmissionUpdateEventFilter =
  TypedEventFilter<RewardEmissionUpdateEvent>;

export interface RewardTransferEventObject {
  rewardToken: string;
  account: string;
  amount: BigNumber;
}
export type RewardTransferEvent = TypedEvent<
  [string, string, BigNumber],
  RewardTransferEventObject
>;

export type RewardTransferEventFilter = TypedEventFilter<RewardTransferEvent>;

export interface SecondaryRewarder extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: SecondaryRewarderInterface;

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
    CURRENCY_ID(overrides?: CallOverrides): Promise<[number]>;

    NOTIONAL(overrides?: CallOverrides): Promise<[string]>;

    NTOKEN_ADDRESS(overrides?: CallOverrides): Promise<[string]>;

    REWARD_TOKEN(overrides?: CallOverrides): Promise<[string]>;

    REWARD_TOKEN_DECIMALS(overrides?: CallOverrides): Promise<[number]>;

    accumulatedRewardPerNToken(overrides?: CallOverrides): Promise<[BigNumber]>;

    claimRewards(
      account: PromiseOrValue<string>,
      currencyId: PromiseOrValue<BigNumberish>,
      nTokenBalanceBefore: PromiseOrValue<BigNumberish>,
      nTokenBalanceAfter: PromiseOrValue<BigNumberish>,
      priorNTokenSupply: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    claimRewardsDirect(
      account: PromiseOrValue<string>,
      nTokenBalanceAtDetach: PromiseOrValue<BigNumberish>,
      proof: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    detach(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    detached(overrides?: CallOverrides): Promise<[boolean]>;

    emissionRatePerYear(overrides?: CallOverrides): Promise<[BigNumber]>;

    endTime(overrides?: CallOverrides): Promise<[number]>;

    "getAccountRewardClaim(address,uint256,bytes32[])"(
      account: PromiseOrValue<string>,
      nTokenBalanceAtDetach: PromiseOrValue<BigNumberish>,
      proof: PromiseOrValue<BytesLike>[],
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { rewardToClaim: BigNumber }>;

    "getAccountRewardClaim(address,uint32)"(
      account: PromiseOrValue<string>,
      blockTime: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { rewardToClaim: BigNumber }>;

    lastAccumulatedTime(overrides?: CallOverrides): Promise<[number]>;

    merkleRoot(overrides?: CallOverrides): Promise<[string]>;

    recover(
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    rewardDebtPerAccount(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    setIncentiveEmissionRate(
      _emissionRatePerYear: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setMerkleRoot(
      _merkleRoot: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  CURRENCY_ID(overrides?: CallOverrides): Promise<number>;

  NOTIONAL(overrides?: CallOverrides): Promise<string>;

  NTOKEN_ADDRESS(overrides?: CallOverrides): Promise<string>;

  REWARD_TOKEN(overrides?: CallOverrides): Promise<string>;

  REWARD_TOKEN_DECIMALS(overrides?: CallOverrides): Promise<number>;

  accumulatedRewardPerNToken(overrides?: CallOverrides): Promise<BigNumber>;

  claimRewards(
    account: PromiseOrValue<string>,
    currencyId: PromiseOrValue<BigNumberish>,
    nTokenBalanceBefore: PromiseOrValue<BigNumberish>,
    nTokenBalanceAfter: PromiseOrValue<BigNumberish>,
    priorNTokenSupply: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  claimRewardsDirect(
    account: PromiseOrValue<string>,
    nTokenBalanceAtDetach: PromiseOrValue<BigNumberish>,
    proof: PromiseOrValue<BytesLike>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  detach(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  detached(overrides?: CallOverrides): Promise<boolean>;

  emissionRatePerYear(overrides?: CallOverrides): Promise<BigNumber>;

  endTime(overrides?: CallOverrides): Promise<number>;

  "getAccountRewardClaim(address,uint256,bytes32[])"(
    account: PromiseOrValue<string>,
    nTokenBalanceAtDetach: PromiseOrValue<BigNumberish>,
    proof: PromiseOrValue<BytesLike>[],
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "getAccountRewardClaim(address,uint32)"(
    account: PromiseOrValue<string>,
    blockTime: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  lastAccumulatedTime(overrides?: CallOverrides): Promise<number>;

  merkleRoot(overrides?: CallOverrides): Promise<string>;

  recover(
    token: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  rewardDebtPerAccount(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  setIncentiveEmissionRate(
    _emissionRatePerYear: PromiseOrValue<BigNumberish>,
    _endTime: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setMerkleRoot(
    _merkleRoot: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    CURRENCY_ID(overrides?: CallOverrides): Promise<number>;

    NOTIONAL(overrides?: CallOverrides): Promise<string>;

    NTOKEN_ADDRESS(overrides?: CallOverrides): Promise<string>;

    REWARD_TOKEN(overrides?: CallOverrides): Promise<string>;

    REWARD_TOKEN_DECIMALS(overrides?: CallOverrides): Promise<number>;

    accumulatedRewardPerNToken(overrides?: CallOverrides): Promise<BigNumber>;

    claimRewards(
      account: PromiseOrValue<string>,
      currencyId: PromiseOrValue<BigNumberish>,
      nTokenBalanceBefore: PromiseOrValue<BigNumberish>,
      nTokenBalanceAfter: PromiseOrValue<BigNumberish>,
      priorNTokenSupply: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    claimRewardsDirect(
      account: PromiseOrValue<string>,
      nTokenBalanceAtDetach: PromiseOrValue<BigNumberish>,
      proof: PromiseOrValue<BytesLike>[],
      overrides?: CallOverrides
    ): Promise<void>;

    detach(overrides?: CallOverrides): Promise<void>;

    detached(overrides?: CallOverrides): Promise<boolean>;

    emissionRatePerYear(overrides?: CallOverrides): Promise<BigNumber>;

    endTime(overrides?: CallOverrides): Promise<number>;

    "getAccountRewardClaim(address,uint256,bytes32[])"(
      account: PromiseOrValue<string>,
      nTokenBalanceAtDetach: PromiseOrValue<BigNumberish>,
      proof: PromiseOrValue<BytesLike>[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getAccountRewardClaim(address,uint32)"(
      account: PromiseOrValue<string>,
      blockTime: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lastAccumulatedTime(overrides?: CallOverrides): Promise<number>;

    merkleRoot(overrides?: CallOverrides): Promise<string>;

    recover(
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    rewardDebtPerAccount(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setIncentiveEmissionRate(
      _emissionRatePerYear: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setMerkleRoot(
      _merkleRoot: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "RewardEmissionUpdate(uint256,uint256)"(
      emissionRatePerYear?: null,
      endTime?: null
    ): RewardEmissionUpdateEventFilter;
    RewardEmissionUpdate(
      emissionRatePerYear?: null,
      endTime?: null
    ): RewardEmissionUpdateEventFilter;

    "RewardTransfer(address,address,uint256)"(
      rewardToken?: PromiseOrValue<string> | null,
      account?: PromiseOrValue<string> | null,
      amount?: null
    ): RewardTransferEventFilter;
    RewardTransfer(
      rewardToken?: PromiseOrValue<string> | null,
      account?: PromiseOrValue<string> | null,
      amount?: null
    ): RewardTransferEventFilter;
  };

  estimateGas: {
    CURRENCY_ID(overrides?: CallOverrides): Promise<BigNumber>;

    NOTIONAL(overrides?: CallOverrides): Promise<BigNumber>;

    NTOKEN_ADDRESS(overrides?: CallOverrides): Promise<BigNumber>;

    REWARD_TOKEN(overrides?: CallOverrides): Promise<BigNumber>;

    REWARD_TOKEN_DECIMALS(overrides?: CallOverrides): Promise<BigNumber>;

    accumulatedRewardPerNToken(overrides?: CallOverrides): Promise<BigNumber>;

    claimRewards(
      account: PromiseOrValue<string>,
      currencyId: PromiseOrValue<BigNumberish>,
      nTokenBalanceBefore: PromiseOrValue<BigNumberish>,
      nTokenBalanceAfter: PromiseOrValue<BigNumberish>,
      priorNTokenSupply: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    claimRewardsDirect(
      account: PromiseOrValue<string>,
      nTokenBalanceAtDetach: PromiseOrValue<BigNumberish>,
      proof: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    detach(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    detached(overrides?: CallOverrides): Promise<BigNumber>;

    emissionRatePerYear(overrides?: CallOverrides): Promise<BigNumber>;

    endTime(overrides?: CallOverrides): Promise<BigNumber>;

    "getAccountRewardClaim(address,uint256,bytes32[])"(
      account: PromiseOrValue<string>,
      nTokenBalanceAtDetach: PromiseOrValue<BigNumberish>,
      proof: PromiseOrValue<BytesLike>[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getAccountRewardClaim(address,uint32)"(
      account: PromiseOrValue<string>,
      blockTime: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lastAccumulatedTime(overrides?: CallOverrides): Promise<BigNumber>;

    merkleRoot(overrides?: CallOverrides): Promise<BigNumber>;

    recover(
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    rewardDebtPerAccount(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setIncentiveEmissionRate(
      _emissionRatePerYear: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setMerkleRoot(
      _merkleRoot: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    CURRENCY_ID(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    NOTIONAL(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    NTOKEN_ADDRESS(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    REWARD_TOKEN(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    REWARD_TOKEN_DECIMALS(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    accumulatedRewardPerNToken(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    claimRewards(
      account: PromiseOrValue<string>,
      currencyId: PromiseOrValue<BigNumberish>,
      nTokenBalanceBefore: PromiseOrValue<BigNumberish>,
      nTokenBalanceAfter: PromiseOrValue<BigNumberish>,
      priorNTokenSupply: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    claimRewardsDirect(
      account: PromiseOrValue<string>,
      nTokenBalanceAtDetach: PromiseOrValue<BigNumberish>,
      proof: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    detach(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    detached(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    emissionRatePerYear(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    endTime(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getAccountRewardClaim(address,uint256,bytes32[])"(
      account: PromiseOrValue<string>,
      nTokenBalanceAtDetach: PromiseOrValue<BigNumberish>,
      proof: PromiseOrValue<BytesLike>[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getAccountRewardClaim(address,uint32)"(
      account: PromiseOrValue<string>,
      blockTime: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lastAccumulatedTime(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    merkleRoot(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    recover(
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    rewardDebtPerAccount(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setIncentiveEmissionRate(
      _emissionRatePerYear: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setMerkleRoot(
      _merkleRoot: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
