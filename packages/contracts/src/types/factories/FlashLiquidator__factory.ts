/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  FlashLiquidator,
  FlashLiquidatorInterface,
} from "../FlashLiquidator";

const _abi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "NOTIONAL",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract NotionalProxy",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "callback",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "paymentReceiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "fee",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "enableCurrencies",
    inputs: [
      {
        name: "currencies",
        type: "uint16[]",
        internalType: "uint16[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "estimateProfit",
    inputs: [
      {
        name: "flashLenderWrapper",
        type: "address",
        internalType: "address",
      },
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "params",
        type: "tuple",
        internalType: "struct FlashLiquidator.LiquidationParams",
        components: [
          {
            name: "liquidationType",
            type: "uint8",
            internalType: "enum FlashLiquidator.LiquidationType",
          },
          {
            name: "vault",
            type: "address",
            internalType: "address",
          },
          {
            name: "accounts",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "redeemData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "currencyId",
            type: "uint16",
            internalType: "uint16",
          },
          {
            name: "currencyIndex",
            type: "uint16",
            internalType: "uint16",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "flashLiquidate",
    inputs: [
      {
        name: "flashLenderWrapper",
        type: "address",
        internalType: "address",
      },
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "params",
        type: "tuple",
        internalType: "struct FlashLiquidator.LiquidationParams",
        components: [
          {
            name: "liquidationType",
            type: "uint8",
            internalType: "enum FlashLiquidator.LiquidationType",
          },
          {
            name: "vault",
            type: "address",
            internalType: "address",
          },
          {
            name: "accounts",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "redeemData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "currencyId",
            type: "uint16",
            internalType: "uint16",
          },
          {
            name: "currencyIndex",
            type: "uint16",
            internalType: "uint16",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "flashLiquidateBatch",
    inputs: [
      {
        name: "flashLenderWrapper",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "asset",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "amount",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "params",
        type: "tuple[]",
        internalType: "struct FlashLiquidator.LiquidationParams[]",
        components: [
          {
            name: "liquidationType",
            type: "uint8",
            internalType: "enum FlashLiquidator.LiquidationType",
          },
          {
            name: "vault",
            type: "address",
            internalType: "address",
          },
          {
            name: "accounts",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "redeemData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "currencyId",
            type: "uint16",
            internalType: "uint16",
          },
          {
            name: "currencyIndex",
            type: "uint16",
            internalType: "uint16",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getOptimalDeleveragingParams",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "currencyIndex",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "maxUnderlying",
        type: "int256",
        internalType: "int256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingOwner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
      {
        name: "direct",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "renounce",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawToOwner",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "wrapETH",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "ERC20Error",
    inputs: [],
  },
  {
    type: "error",
    name: "ErrInvalidCurrencyIndex",
    inputs: [
      {
        name: "index",
        type: "uint16",
        internalType: "uint16",
      },
    ],
  },
];

export class FlashLiquidator__factory {
  static readonly abi = _abi;
  static createInterface(): FlashLiquidatorInterface {
    return new utils.Interface(_abi) as FlashLiquidatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FlashLiquidator {
    return new Contract(address, _abi, signerOrProvider) as FlashLiquidator;
  }
}
