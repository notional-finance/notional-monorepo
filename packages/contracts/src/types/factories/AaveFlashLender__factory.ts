/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  AaveFlashLender,
  AaveFlashLenderInterface,
} from "../AaveFlashLender";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "receiverAddress",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "assets",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "modes",
        type: "uint256[]",
      },
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "params",
        type: "bytes",
      },
      {
        internalType: "uint16",
        name: "referralCode",
        type: "uint16",
      },
    ],
    name: "flashLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class AaveFlashLender__factory {
  static readonly abi = _abi;
  static createInterface(): AaveFlashLenderInterface {
    return new utils.Interface(_abi) as AaveFlashLenderInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AaveFlashLender {
    return new Contract(address, _abi, signerOrProvider) as AaveFlashLender;
  }
}
