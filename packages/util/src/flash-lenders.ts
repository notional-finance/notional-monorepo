// all addresses need to be checksummed
import { ethers } from 'ethers';
import { Network } from './constants';

// from https://github.com/alcueca/erc7399-wrappers
const wrappedFlashLenders: Partial<Record<Network, Record<string, string>>> = {
  [Network.mainnet]: {
    AAVE: '0x0c86c636ed5593705b5675d370c831972C787841',
    BALANCER: '0x9E092cb431e5F1aa70e47e052773711d2Ba4917E',
  },
  [Network.arbitrum]: {
    AAVE: '0x9D4D2C08b29A2Db1c614483cd8971734BFDCC9F2',
    BALANCER: '0x9E092cb431e5F1aa70e47e052773711d2Ba4917E',
  },
};

const tokens: Partial<Record<Network, Record<string, string>>> = {
  [Network.mainnet]: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    GHO: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
  },
  [Network.arbitrum]: {},
};

const defaultFlashLenders = {
  [Network.mainnet]: wrappedFlashLenders.mainnet['AAVE'],
  [Network.arbitrum]: wrappedFlashLenders.arbitrum['AAVE'],
};

const perVaultFlashLenders: Record<string, string> = {};

const perTokenFlashLenders = {
  [Network.mainnet]: {
    default: wrappedFlashLenders.mainnet['AAVE'],
    // NOTE: this is set to USDT because the Aave flash lender does not use the proper
    // checkApprove method within it
    [tokens.mainnet['USDT']]: wrappedFlashLenders.mainnet['BALANCER'],
    [tokens.mainnet['GHO']]: wrappedFlashLenders.mainnet['BALANCER'],
  },
  [Network.arbitrum]: {},
};

const checkSumAddress = (address: string) => {
  // Convert to checksum version or throw if invalid checksum
  return ethers.utils.getAddress(address);
};

export function getFlashLender({
  network,
  vault = '',
  token,
}: {
  network: Network;
  vault?: string;
  token: string;
}): string {
  return (
    perVaultFlashLenders[checkSumAddress(vault)] ||
    perTokenFlashLenders[checkSumAddress(token)] ||
    defaultFlashLenders[network]
  );
}
