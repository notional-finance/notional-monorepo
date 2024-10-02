// all addresses need to be checksummed
import { ethers } from 'ethers';
import { Network } from './constants';

// from https://github.com/alcueca/erc7399-wrappers
const wrappedFlashLenders: Record<Network, Record<string, string>> = {
  [Network.mainnet]: {
    AAVE: '0x0c86c636ed5593705b5675d370c831972C787841',
    BALANCER: '0x9E092cb431e5F1aa70e47e052773711d2Ba4917E',
    UNIV3: '0x319300462C37AD2D4f26B584C2b67De51F51f289',
  },
  [Network.arbitrum]: {
    AAVE: '0x9D4D2C08b29A2Db1c614483cd8971734BFDCC9F2',
    BALANCER: '0x9E092cb431e5F1aa70e47e052773711d2Ba4917E',
    CAMELOT: '0x5E8820B2832aD8451f65Fa2CCe2F3Cef29016D0d',
    UNIV3: '0x319300462C37AD2D4f26B584C2b67De51F51f289',
  },
  [Network.all]: {},
  [Network.optimism]: {},
};

const tokens = {
  [Network.mainnet]: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    GHO: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
  },
  [Network.arbitrum]: {
    cbETH: '0x1DEBd73E752bEaF79865Fd6446b0c970EaE7732f',
    GMX: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
    RDNT: '0x3082CC23568eA640225c2467653dB90e9250AaA0',
    UNI: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
    LDO: '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60',
    tBTC: '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40',
  },
};

const defaultFlashLenders = {
  [Network.mainnet]: wrappedFlashLenders.mainnet['AAVE'],
  [Network.arbitrum]: wrappedFlashLenders.arbitrum['AAVE'],
  [Network.all]: wrappedFlashLenders.mainnet['AAVE'],
  [Network.optimism]: '',
};

const perVaultFlashLenders: Record<string, string> = {};

const perTokenFlashLenders: Record<Network, Record<string, string>> = {
  [Network.mainnet]: {
    default: wrappedFlashLenders.mainnet['AAVE'],
    // NOTE: this is set to USDT because the Aave flash lender does not use the proper
    // checkApprove method within it
    [tokens.mainnet['USDT']]: wrappedFlashLenders.mainnet['BALANCER'],
    [tokens.mainnet['GHO']]: wrappedFlashLenders.mainnet['BALANCER'],
  },
  [Network.arbitrum]: {
    [tokens.arbitrum['cbETH']]: wrappedFlashLenders.arbitrum['BALANCER'],
    [tokens.arbitrum['GMX']]: wrappedFlashLenders.arbitrum['UNIV3'],
    [tokens.arbitrum['RDNT']]: wrappedFlashLenders.arbitrum['BALANCER'],
    [tokens.arbitrum['UNI']]: wrappedFlashLenders.arbitrum['UNIV3'],
    [tokens.arbitrum['tBTC']]: wrappedFlashLenders.arbitrum['UNIV3'],
  },
  [Network.all]: {},
  [Network.optimism]: {},
};
const checkSumAddress = (address: string) => {
  // Convert to checksum version or throw if invalid checksum
  return address ? ethers.utils.getAddress(address) : '';
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
    perTokenFlashLenders[network][checkSumAddress(token)] ||
    defaultFlashLenders[network]
  );
}

/** Returns a comma delimited list of excluded sources for use in 0x */
export function getExcludedSources(
  network: Network,
  flashLenderAddress: string
): string | undefined {
  const n = Object.entries(wrappedFlashLenders[network]).find(
    ([_, address]) => address.toLowerCase() === flashLenderAddress.toLowerCase()
  );
  const name = n ? n[0] : '';
  return zeroExSources[network] ? zeroExSources[network][name] : undefined;
}

// https://0x.org/docs/0x-swap-api/api-references/get-swap-v1-sources
const zeroExSources: Record<Network, Record<string, string>> = {
  [Network.mainnet]: {
    BALANCER: 'Balancer_V2',
    UNIV3: 'Uniswap_V3',
  },
  [Network.arbitrum]: {
    BALANCER: 'Balancer_V2',
    CAMELOT: 'Camelot_V3',
    UNIV3: 'Uniswap_V3',
  },
  [Network.all]: {},
  [Network.optimism]: {},
};
