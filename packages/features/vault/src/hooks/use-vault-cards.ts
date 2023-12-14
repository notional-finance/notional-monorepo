import { formatLeverageRatio } from '@notional-finance/helpers';
import { VaultCardOverlay, VaultCardIcon } from '../components';
import {
  useAllMarkets,
  useAllVaults,
  useVaultRiskProfiles,
} from '@notional-finance/notionable-hooks';

interface AllVaultsProps {
  capacityRemaining: string;
  capacityUsedPercentage: number;
  hasPosition: boolean;
  headlineRate: number;
  leverage: string;
  minDepositRequired: string;
  netWorth?: string;
  underlyingSymbol: string;
  vaultAddress: string;
  vaultName: string;
  VaultCardOverlay?: any;
  VaultCardIcon?: any;
  accessGroup?: string;
}

export const useVaultCards = () => {
  const listedVaults = useAllVaults();
  const accountVaults = useVaultRiskProfiles();
  const {
    yields: { leveragedVaults },
    getMax,
  } = useAllMarkets();

  const allVaults = listedVaults.map(
    ({
      vaultAddress,
      minDepositRequired,
      name,
      maxPrimaryBorrowCapacity,
      totalUsedPrimaryBorrowCapacity,
      primaryToken,
    }) => {
      const y = getMax(
        leveragedVaults.filter((y) => y.token.vaultAddress === vaultAddress)
      );
      const capacityRemaining = maxPrimaryBorrowCapacity.sub(
        totalUsedPrimaryBorrowCapacity
      );
      const capacityUsedPercentage = totalUsedPrimaryBorrowCapacity
        .scale(100, maxPrimaryBorrowCapacity)
        .toNumber();
      const vaultPosition = accountVaults.find(
        (p) => p.vaultAddress === vaultAddress
      );
      const leverage = formatLeverageRatio(
        vaultPosition?.leverageRatio() || y?.leveraged?.leverageRatio || 0,
        1
      );

      return {
        vaultAddress: vaultAddress,
        minDepositRequired,
        underlyingSymbol: primaryToken.symbol,
        hasPosition: !!vaultPosition,
        headlineRate: vaultPosition?.totalAPY || y?.totalAPY,
        netWorth: vaultPosition?.netWorth().toDisplayStringWithSymbol(3, true),
        leverage,
        vaultName: name,
        capacityUsedPercentage,
        capacityRemaining: capacityRemaining.toDisplayStringWithSymbol(0),
        VaultCardOverlay,
        VaultCardIcon,
      };
    }
  );

  // const test = {
  //   capacityRemaining: '3000 FRAX',
  //   capacityUsedPercentage: 90,
  //   hasPosition: false,
  //   headlineRate: 72.28363884109214,
  //   leverage: '6.7x',
  //   minDepositRequired: '150.00 FUCK to 2,000.00 FUCK',
  //   netWorth: undefined,
  //   underlyingSymbol: 'FRAX',
  //   vaultAddress: '0xdb08f663e5d765949054785f2ed1b2aa1e9c23234rf',
  //   vaultName: 'Curve FUCK/USDC LP (FUCK Leverage)',
  //   VaultCardOverlay: VaultCardOverlay,
  // };

  // allVaults.push(test);

  return allVaults as AllVaultsProps[];
};
