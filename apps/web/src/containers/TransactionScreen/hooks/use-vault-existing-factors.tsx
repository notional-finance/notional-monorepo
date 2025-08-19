import { TokenDefinition } from '@notional-finance/core-entities';

export const useVaultExistingFactors = () => {
  return {
    vaultShare: undefined as TokenDefinition | undefined,
    priorBorrowRate: undefined as number | undefined,
    debt: undefined as TokenDefinition | undefined,
    leverageRatio: undefined as number | undefined,
  };
};
