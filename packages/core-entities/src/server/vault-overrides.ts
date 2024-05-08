import { Network, getProviderFromNetwork } from '@notional-finance/util';
import {
  Curve2TokenConvexVault,
  Curve2TokenConvexVaultABI,
} from '@notional-finance/contracts';
import { Contract } from 'ethers';
import { TokenBalance } from '../token-balance';

function getCurveVaultInfo(network: Network, vaultAddress: string) {
  return {
    target: new Contract(
      vaultAddress,
      Curve2TokenConvexVaultABI,
      getProviderFromNetwork(network)
    ),
    method: 'getStrategyContext',
    key: vaultAddress,
    transform: (
      r: Awaited<ReturnType<Curve2TokenConvexVault['getStrategyContext']>>
    ) => {
      const totalLPTokens = TokenBalance.toJSON(
        r.baseStrategy.vaultState.totalPoolClaim,
        r.poolContext.basePool.poolToken,
        network
      );
      const totalVaultShares = r.baseStrategy.vaultState.totalVaultSharesGlobal;
      return {
        pool: r.poolContext.curvePool,
        singleSidedTokenIndex: r.poolContext.basePool.primaryIndex,
        totalLPTokens,
        totalVaultShares,
        secondaryTradeParams: '0x',
      };
    },
  };
}

interface VaultInfoOverride {
  fromBlock?: number;
  toBlock?: number;
  getVaultInfo: (network: Network, vaultAddress: string) => unknown;
}

export const vaultOverrides: Record<string, VaultInfoOverride[]> = {
  '0xae38f4b960f44d86e798f36a374a1ac3f2d859fa': [
    {
      getVaultInfo: getCurveVaultInfo,
      toBlock: 124617290,
    },
  ],
  '0xdb08f663e5d765949054785f2ed1b2aa1e9c22cf': [
    {
      getVaultInfo: getCurveVaultInfo,
      toBlock: 124617290,
    },
  ],
};

// These are deprecated vaults with old method signatures
export const DeprecatedVaults = [
  '0xae38f4b960f44d86e798f36a374a1ac3f2d859fa',
  '0xb9bdaa34ea52c3e2f3ec39fcd8146887e6b1c78c',
  '0xb6efe4f505248846465f944801e299c14269126b',
];
