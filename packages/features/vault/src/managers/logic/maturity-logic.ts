import { MaturityData } from '@notional-finance/notionable';
import {
  GenericBaseVault,
  BigNumberType,
  TypedBigNumber,
  VaultAccount,
} from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { convertRateToFloat, logError } from '@notional-finance/helpers';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';

interface VaultMaturityDataDependencies {
  // Inputs
  vaultAction?: VAULT_ACTIONS;
  depositAmount?: TypedBigNumber;
  leverageRatio: number;
  selectedMarketKey?: string;
  // Via Init
  vaultAccount: VaultAccount;
  eligibleMarkets: Market[];
  baseVault: GenericBaseVault;
  settledVaultValues?: {
    strategyTokens: TypedBigNumber;
    assetCash: TypedBigNumber;
  };
}

export function getMaturityData({
  vaultAccount,
  vaultAction,
  depositAmount,
  eligibleMarkets,
  leverageRatio,
  baseVault,
  settledVaultValues,
  selectedMarketKey,
}: VaultMaturityDataDependencies) {
  let vaultMaturityData: MaturityData[];

  if (vaultAction === VAULT_ACTIONS.ESTABLISH_ACCOUNT) {
    vaultMaturityData = establishAccountMaturityData(
      vaultAccount,
      depositAmount,
      eligibleMarkets,
      leverageRatio,
      baseVault,
      settledVaultValues
    );
  } else if (vaultAction === VAULT_ACTIONS.INCREASE_POSITION) {
    vaultMaturityData = increaseAccountMaturityData(
      vaultAccount,
      depositAmount,
      eligibleMarkets,
      leverageRatio,
      baseVault
    );
  } else if (vaultAction === VAULT_ACTIONS.ROLL_POSITION) {
    vaultMaturityData = rollAccountMaturityData(
      vaultAccount,
      depositAmount,
      eligibleMarkets,
      leverageRatio,
      baseVault
    );
  } else {
    vaultMaturityData = [];
  }

  const selectedMaturity = vaultMaturityData.find(
    (m) => m.marketKey === selectedMarketKey
  );
  return {
    vaultMaturityData,
    fCashBorrowAmount: selectedMaturity?.fCashAmount,
    currentBorrowRate: selectedMaturity?.tradeRate,
  };
}

function calculateMaturityData(
  market: Market,
  baseVault: GenericBaseVault,
  fCashToBorrow: TypedBigNumber | undefined,
  insufficentLiquidity: boolean
) {
  let tradeRate: number | null;
  if (fCashToBorrow) {
    const { cashToVault } = baseVault.getDepositedCashFromBorrow(
      market.maturity,
      fCashToBorrow
    );
    tradeRate = market.interestRate(fCashToBorrow, cashToVault);
  } else if (insufficentLiquidity) {
    tradeRate = null;
  } else {
    tradeRate = market.marketAnnualizedRate();
  }

  return {
    marketKey: market.marketKey,
    tradeRate: tradeRate !== null ? convertRateToFloat(tradeRate) : undefined,
    tradeRateString: tradeRate ? Market.formatInterestRate(tradeRate) : '',
    maturity: market.maturity,
    hasLiquidity: market.hasLiquidity,
    fCashAmount: fCashToBorrow,
  };
}

function establishAccountMaturityData(
  vaultAccount: VaultAccount,
  depositAmount: TypedBigNumber | undefined,
  eligibleMarkets: Market[],
  leverageRatio: number,
  baseVault: GenericBaseVault,
  settledVaultValues?: {
    strategyTokens: TypedBigNumber;
    assetCash: TypedBigNumber;
  }
) {
  return eligibleMarkets.map((m) => {
    let fCashToBorrow: TypedBigNumber | undefined;
    let settledVaultAccount = vaultAccount;
    const depositAmountInternal = depositAmount?.toInternalPrecision();
    let insufficientLiquidity = false;

    try {
      if (depositAmountInternal) {
        if (settledVaultValues) {
          // Create a new vault account that represents the post settlement
          // vault account
          settledVaultAccount = VaultAccount.emptyVaultAccount(
            vaultAccount.vaultAddress,
            m.maturity
          );

          let totalStrategyTokensToAccount = TypedBigNumber.from(
            settledVaultValues.strategyTokens.n,
            BigNumberType.StrategyToken,
            baseVault.getVaultSymbol(m.maturity)
          );

          if (settledVaultValues.assetCash.isPositive()) {
            const { strategyTokens } = baseVault.getStrategyTokensGivenDeposit(
              m.maturity,
              settledVaultValues.assetCash.toUnderlying()
            );
            totalStrategyTokensToAccount =
              totalStrategyTokensToAccount.add(strategyTokens);
          }

          // Add the strategy tokens
          settledVaultAccount.addStrategyTokens(
            totalStrategyTokensToAccount,
            baseVault.simulateSettledStrategyTokens
          );
        }

        fCashToBorrow = baseVault.getfCashBorrowFromLeverageRatio(
          m.maturity,
          depositAmountInternal,
          leverageRatio,
          settledVaultAccount
        );
      }
    } catch (e) {
      logError(e as Error, 'deposit-manager', 'getfCashMarketRates');
      insufficientLiquidity = true;
    }

    return calculateMaturityData(
      m,
      baseVault,
      fCashToBorrow,
      insufficientLiquidity
    );
  });
}

function increaseAccountMaturityData(
  vaultAccount: VaultAccount,
  depositAmount: TypedBigNumber | undefined,
  eligibleMarkets: Market[],
  leverageRatio: number,
  baseVault: GenericBaseVault
) {
  return eligibleMarkets
    .filter((m) => vaultAccount.maturity === m.maturity)
    .map((m) => {
      let fCashToBorrow: TypedBigNumber | undefined;
      let insufficientLiquidity = false;
      const depositInternal =
        depositAmount?.toInternalPrecision() ||
        TypedBigNumber.getZeroUnderlying(m.currencyId);

      try {
        fCashToBorrow = baseVault.getfCashBorrowFromLeverageRatio(
          m.maturity,
          depositInternal,
          leverageRatio,
          vaultAccount
        );
      } catch (e) {
        logError(e as Error, 'deposit-manager', 'getfCashMarketRates');
        insufficientLiquidity = true;
      }

      return calculateMaturityData(
        m,
        baseVault,
        fCashToBorrow,
        insufficientLiquidity
      );
    });
}

function rollAccountMaturityData(
  vaultAccount: VaultAccount,
  depositAmount: TypedBigNumber | undefined,
  eligibleMarkets: Market[],
  leverageRatio: number,
  baseVault: GenericBaseVault
) {
  return eligibleMarkets
    .filter((m) => vaultAccount.maturity < m.maturity)
    .map((m) => {
      let fCashToBorrow: TypedBigNumber | undefined;
      let insufficientLiquidity = false;
      const depositInternal =
        depositAmount?.toInternalPrecision() ||
        TypedBigNumber.getZeroUnderlying(m.currencyId);

      try {
        const { fCashToBorrowForRepayment, newVaultAccount } =
          baseVault.simulateRollPosition(
            vaultAccount,
            m.maturity,
            depositInternal,
            0
          );

        // Run this to get any additional fCash to borrow as a result of the simulate roll
        const additionalfCashToBorrow =
          baseVault.getfCashBorrowFromLeverageRatio(
            m.maturity,
            depositInternal.copy(0),
            leverageRatio,
            newVaultAccount
          );
        fCashToBorrow = fCashToBorrowForRepayment.add(additionalfCashToBorrow);
      } catch (e) {
        logError(e as Error, 'deposit-manager', 'getfCashMarketRates');
        insufficientLiquidity = true;
      }

      return calculateMaturityData(
        m,
        baseVault,
        fCashToBorrow,
        insufficientLiquidity
      );
    });
}
