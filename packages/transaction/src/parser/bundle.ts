import {
  Burn,
  fCash,
  FeeReserve,
  Mint,
  None,
  NOTE,
  Notional,
  nToken,
  PrimeCash,
  PrimeDebt,
  PRIME_CASH_VAULT_MATURITY,
  SettlementReserve,
  Transfer as _Transfer,
  Vault,
  VaultCash,
  VaultDebt,
  VaultShare,
} from "./constants";


class Criteria {
  bundleName: string;
  windowSize: number;
  func: (window: Transfer[]) => boolean;
  lookBehind: number;
  canStart: boolean;
  rewrite: boolean;
  bundleSize: number;

  constructor(
    bundleName: string,
    windowSize: number,
    func: (window: Transfer[]) => boolean,
    lookBehind = 0,
    canStart = false,
    rewrite = false,
    bundleSize = 0
  ) {
    this.bundleName = bundleName;
    this.windowSize = windowSize;
    this.func = func;
    this.lookBehind = lookBehind;
    this.canStart = canStart;
    this.rewrite = rewrite;
    this.bundleSize = bundleSize == 0 ? this.windowSize : bundleSize;
  }
}

const deposit = (w: Transfer[]): boolean => { 
  if (w.length == 1) {
    return (
      w[0].transferType == Mint &&
      w[0].tokenType == PrimeCash &&
      w[0].to != FeeReserve
    )
  } else {
    return !( // not
      w[0].transferType == Mint &&
      w[0].tokenType == PrimeDebt
    ) && (
      w[1].transferType == Mint &&
      w[1].tokenType == PrimeCash &&
      w[1].toSystemAccount == None
    )
  }
}

const mint_pcash_fee = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Mint &&
    w[0].tokenType == PrimeCash &&
    w[0].toSystemAccount == FeeReserve
  )
}

const withdraw = (w: Transfer[]): boolean => {
  if (w.length == 1) {
    return (
      w[0].transferType == Burn &&
      w[0].tokenType == PrimeCash &&
      w[0].to == None
    )
  } else {
    return !( // not
      w[0].transferType == Burn &&
      w[0].tokenType == PrimeDebt
    ) && (
      w[1].transferType == Burn &&
      w[1].tokenType == PrimeCash &&
      w[1].toSystemAccount == None
    )
  }
}

const deposit_transfer = (w: Transfer[]): boolean => {
  return (
    deposit(w.slice(0, 1))
  ) && (
    w[1].transferType == _Transfer &&
    w[1].tokenType == PrimeCash &&
    w[1].toSystemAccount != nToken
  ) && (
    w[0].to == w[1].from &&
    w[0].token == w[1].token
  )
}

const ntoken_residual_transfer = (w: Transfer[]): boolean => {
  return !( // not
    w[0].tokenType == PrimeCash &&
    w[0].transferType == _Transfer &&
    w[0].toSystemAccount == FeeReserve
  ) && (
    w[1].tokenType == fCash &&
    w[1].transferType == _Transfer &&
    (w[1].fromSystemAccount == nToken || w[1].toSystemAccount == nToken)
  )
}

const ntoken_purchase_positive_residual = (w: Transfer[]): boolean => {
  return !( // not
    w[0].tokenType == PrimeCash &&
    w[0].transferType == _Transfer &&
    w[0].toSystemAccount == FeeReserve
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == _Transfer &&
    w[1].toSystemAccount == nToken
  ) && (
    w[2].tokenType == fCash &&
    w[2].transferType == _Transfer &&
    w[2].fromSystemAccount == nToken
  )
}

const ntoken_purchase_negative_residual = (w: Transfer[]): boolean => {
  return !( // not
    w[0].tokenType == PrimeCash &&
    w[0].transferType == _Transfer &&
    w[0].toSystemAccount == FeeReserve
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == _Transfer &&
    w[1].fromSystemAccount == nToken
  ) && (
    // Account transfers positive fcash
    w[2].tokenType == fCash &&
    w[2].transferType == _Transfer &&
    w[2].fromSystemAccount == None &&
    w[2].toSystemAccount == nToken
  ) && (
    // nToken burns fcash pair
    w[3].tokenType == fCash &&
    w[3].transferType == Burn &&
    w[3].fromSystemAccount == nToken
  ) && (
    w[4].tokenType == fCash &&
    w[4].transferType == Burn &&
    w[4].fromSystemAccount == nToken
  ) && (
    w[2].value == w[3].value &&
    w[3].value == w[4].value.neg()
  )
}

const transfer_asset = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == _Transfer &&
    w[0].fromSystemAccount == None &&
    w[0].toSystemAccount == None
  )
}
const transfer_incentive = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == _Transfer &&
    w[0].tokenType == NOTE &&
    w[0].fromSystemAccount == Notional &&
    w[0].toSystemAccount == None
  )
}

const settle_cash = (w: Transfer[]): boolean => {
  return (
    w[0].fromSystemAccount == SettlementReserve &&
    w[0].transferType == _Transfer &&
    w[0].toSystemAccount == None &&
    (w[0].tokenType == PrimeCash || w[0].tokenType == PrimeDebt)
  )
}

const settle_cash_ntoken = (w: Transfer[]): boolean => {
  return (
    w[0].fromSystemAccount == SettlementReserve &&
    w[0].transferType == _Transfer &&
    w[0].toSystemAccount == nToken &&
    (w[0].tokenType == PrimeCash || w[0].tokenType == PrimeDebt)
  )
}

const settle_cash_vault = (w: Transfer[]): boolean => {
  return (
    w[0].fromSystemAccount == SettlementReserve &&
    w[0].transferType == _Transfer &&
    w[0].toSystemAccount == Vault &&
    (w[0].tokenType == PrimeCash || w[0].tokenType == PrimeDebt)
  )
}

const settle_fcash = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Burn &&
    w[0].tokenType == fCash &&
    w[0].fromSystemAccount != nToken &&
    w[0].fromSystemAccount != Vault &&
    (w[0].get("maturity") != null && w[0].maturity <= w[0].timestamp)
  )
}

const settle_fcash_ntoken = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Burn &&
    w[0].tokenType == fCash &&
    w[0].fromSystemAccount == nToken &&
    (w[0].get("maturity") != null && w[0].maturity <= w[0].timestamp)
  )
}

const settle_fcash_vault = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Burn &&
    w[0].tokenType == fCash &&
    w[0].fromSystemAccount == Vault &&
    (w[0].get("maturity") != null && w[0].maturity <= w[0].timestamp)
  )
}

const borrow_prime_cash = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeDebt &&
    w[0].transferType == Mint &&
    w[0].toSystemAccount != SettlementReserve &&
    w[0].toSystemAccount != Vault
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == Mint &&
    w[1].toSystemAccount != SettlementReserve &&
    w[1].toSystemAccount != Vault
  )
}

const global_settlement = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeDebt &&
    w[0].transferType == Mint &&
    w[0].toSystemAccount == SettlementReserve
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == Mint &&
    w[1].toSystemAccount == SettlementReserve
  )
}

const borrow_prime_cash_vault = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeDebt &&
    w[0].transferType == Mint &&
    w[0].toSystemAccount == Vault
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == Mint &&
    w[1].toSystemAccount == Vault
  )
}

const repay_prime_cash = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeDebt &&
    w[0].transferType == Burn &&
    w[0].toSystemAccount != SettlementReserve &&
    w[0].toSystemAccount != Vault
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == Burn &&
    w[1].toSystemAccount != SettlementReserve &&
    w[1].toSystemAccount != Vault
  )
}

const repay_prime_cash_vault = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeDebt &&
    w[0].transferType == Burn &&
    w[0].toSystemAccount == Vault
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == Burn &&
    w[1].toSystemAccount == Vault
  )
}

const borrow_fcash = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == fCash &&
    w[0].transferType == Mint
  ) && (
    w[1].tokenType == fCash &&
    w[1].transferType == Mint
  ) && (
    w[0].logIndex == w[1].logIndex &&
    w[0].toSystemAccount == None
  )
}

const borrow_fcash_vault = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == fCash &&
    w[0].transferType == Mint
  ) && (
    w[1].tokenType == fCash &&
    w[1].transferType == Mint
  ) && (
    w[0].logIndex == w[1].logIndex &&
    w[0].toSystemAccount == Vault
  )
}

const ntoken_add_liquidity = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == fCash &&
    w[0].transferType == Mint
  ) && (
    w[1].tokenType == fCash &&
    w[1].transferType == Mint
  ) && (
    w[0].logIndex == w[1].logIndex &&
    w[0].toSystemAccount == nToken
  )
}

const repay_fcash = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == fCash &&
    w[0].transferType == Burn
  ) && (
    w[1].tokenType == fCash &&
    w[1].transferType == Burn
  ) && (
    w[0].logIndex == w[1].logIndex &&
    w[0].toSystemAccount == None
  )
}

const repay_fcash_vault = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == fCash &&
    w[0].transferType == Burn
  ) && (
    w[1].tokenType == fCash &&
    w[1].transferType == Burn
  ) && (
    w[0].logIndex == w[1].logIndex &&
    w[0].toSystemAccount == Vault
  )
}

const ntoken_remove_liquidity = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == fCash &&
    w[0].transferType == Burn
  ) && (
    w[1].tokenType == fCash &&
    w[1].transferType == Burn
  ) && (
    w[0].logIndex == w[1].logIndex &&
    w[0].toSystemAccount == nToken
  )
}

const mint_ntoken = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeCash &&
    w[0].transferType == _Transfer &&
    w[0].toSystemAccount == nToken
  ) && (
    w[1].tokenType == nToken &&
    w[1].transferType == Mint
  )
}

const redeem_ntoken = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeCash &&
    w[0].transferType == _Transfer &&
    w[0].fromSystemAccount == nToken
  ) && (
    w[1].tokenType == nToken &&
    w[1].transferType == Burn
  )
}
const buy_fcash = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeCash &&
    w[0].transferType == _Transfer &&
    w[0].fromSystemAccount != Vault &&
    w[0].toSystemAccount == nToken
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == _Transfer &&
    w[1].toSystemAccount == FeeReserve
  ) && (
    w[2].tokenType == fCash &&
    w[2].transferType == _Transfer &&
    w[2].fromSystemAccount == nToken &&
    w[2].toSystemAccount != nToken &&
    w[2].toSystemAccount != Vault
  )
}

const buy_fcash_vault = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeCash &&
    w[0].transferType == _Transfer &&
    w[0].fromSystemAccount == Vault &&
    w[0].toSystemAccount == nToken
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == _Transfer &&
    w[1].toSystemAccount == FeeReserve
  ) && (
    w[2].tokenType == fCash &&
    w[2].transferType == _Transfer &&
    w[2].fromSystemAccount == nToken &&
    w[2].toSystemAccount == Vault
  )
}

const ntoken_deleverage = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeCash &&
    w[0].transferType == _Transfer &&
    w[0].fromSystemAccount == nToken &&
    w[0].toSystemAccount == nToken
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == _Transfer &&
    w[1].toSystemAccount == FeeReserve
  ) && (
    w[2].tokenType == fCash &&
    w[2].transferType == _Transfer &&
    w[2].fromSystemAccount == nToken &&
    w[2].toSystemAccount == nToken
  )
}

const sell_fcash = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeCash &&
    w[0].transferType == _Transfer &&
    w[0].fromSystemAccount == nToken &&
    w[0].toSystemAccount != Vault
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == _Transfer &&
    w[1].toSystemAccount == FeeReserve
  ) && (
    w[2].tokenType == fCash &&
    w[2].transferType == _Transfer &&
    w[2].fromSystemAccount != Vault &&
    w[2].toSystemAccount == nToken
  )
}
const sell_fcash_vault = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeCash &&
    w[0].transferType == _Transfer &&
    w[0].fromSystemAccount == nToken &&
    w[0].toSystemAccount == Vault
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == _Transfer &&
    w[1].toSystemAccount == FeeReserve
  ) && (
    w[2].tokenType == fCash &&
    w[2].transferType == _Transfer &&
    w[2].fromSystemAccount == Vault &&
    w[2].toSystemAccount == nToken
  )
}

const vault_fees = (w: Transfer[]): boolean => {
  return (
    w[0].tokenType == PrimeCash &&
    w[0].transferType == _Transfer &&
    w[0].toSystemAccount == FeeReserve
  ) && (
    w[1].tokenType == PrimeCash &&
    w[1].transferType == _Transfer &&
    w[1].toSystemAccount == nToken
  )
}

const vault_entry_transfer = (w: Transfer[]): boolean => {
  // Looks like a withdraw but is done by the vault
  return !( // not
    w[0].transferType == Mint &&
    w[0].tokenType == PrimeDebt
  ) && (
    w[1].transferType == Burn &&
    w[1].tokenType == PrimeCash &&
    w[1].fromSystemAccount == Vault
  )
}

const vault_redeem = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Mint &&
    w[0].tokenType == PrimeCash &&
    w[0].toSystemAccount == Vault
  ) && (
    w[1].transferType == _Transfer &&
    w[1].tokenType == PrimeCash &&
    w[1].fromSystemAccount == Vault
  ) && (
    w[2].transferType == Burn &&
    w[2].tokenType == PrimeCash &&
    w[2].from == w[1].to
  )
}

const vault_lend_at_zero = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == _Transfer &&
    w[0].fromSystemAccount == Vault &&
    w[0].toSystemAccount == SettlementReserve &&
    w[0].tokenType == PrimeCash
  ) && (
    w[1].tokenType == fCash &&
    w[1].transferType == Mint
  ) && (
    w[2].tokenType == fCash &&
    w[2].transferType == Mint
  ) && (
    w[1].logIndex == w[2].logIndex &&
    w[1].toSystemAccount == SettlementReserve
  ) && (
    w[3].transferType == _Transfer &&
    w[3].fromSystemAccount == SettlementReserve &&
    w[3].toSystemAccount == Vault &&
    w[3].tokenType == fCash &&
    w[3].value.gt(BigInt.fromI32(0))
  )
}

const vault_settle = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Burn &&
    w[0].tokenType == VaultDebt &&
    w[0].maturity <= w[0].timestamp
  ) && (
    w[1].transferType == Burn &&
    w[1].tokenType == VaultShare &&
    w[1].maturity <= w[1].timestamp
  ) && (
    w[2].transferType == Mint &&
    w[2].tokenType == VaultDebt &&
    w[2].maturity == PRIME_CASH_VAULT_MATURITY
  ) && (
    w[3].transferType == Burn &&
    w[3].tokenType == VaultShare &&
    w[3].maturity == PRIME_CASH_VAULT_MATURITY
  )
}

const vault_roll = (w: Transfer[]): boolean => {
  return !( // not
    vault_settle(w)
  ) && (
    w[0].transferType == Burn &&
    w[0].tokenType == VaultDebt &&
    !w[0].value.isZero()
  ) && (
    w[1].transferType == Burn &&
    w[1].tokenType == VaultShare && 
    !w[1].value.isZero()
  ) && (
    w[2].transferType == Mint &&
    w[2].tokenType == VaultDebt &&
    !w[2].value.isZero()
  ) && (
    w[3].transferType == Burn &&
    w[3].tokenType == VaultShare &&
    !w[3].value.isZero()
  )
}

const vault_entry = (w: Transfer[]): boolean => {
  return ( // not
    !vault_settle(w)
  ) && ( // not
    !vault_roll(w)
  ) && (
    w[2].transferType == Mint &&
    w[2].tokenType == VaultDebt
  ) && (
    w[3].transferType == Burn &&
    w[3].tokenType == VaultShare
  )
}

const vault_exit = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Burn &&
    w[0].tokenType == VaultDebt
  ) && (
    w[1].transferType == Burn &&
    w[1].tokenType == VaultShare
  )
}

const vault_deleverage_fcash = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Mint &&
    w[0].tokenType == VaultCash
  ) && (
    w[1].transferType == _Transfer &&
    w[1].tokenType == VaultShare
  )
}

const vault_deleverage_prime_debt = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Burn &&
    w[0].tokenType == VaultDebt &&
    w[0].maturity == PRIME_CASH_VAULT_MATURITY
  ) && (
    w[1].transferType == _Transfer &&
    w[1].tokenType == VaultShare &&
    w[1].maturity == PRIME_CASH_VAULT_MATURITY
  )
}

const vault_liquidate_cash = (w: Transfer[]): boolean => {
  // Liquidator receives cash and sends fCash
  return (
    w[0].transferType == _Transfer &&
    w[0].fromSystemAccount == Vault &&
    w[0].tokenType == PrimeCash
  ) && (
    w[1].transferType == _Transfer &&
    w[1].toSystemAccount == Vault &&
    w[1].tokenType == fCash
  // Account burns debt and cash
  ) && (
    w[2].transferType == Burn &&
    w[2].tokenType == VaultDebt
  ) && (
    w[3].transferType == Burn &&
    w[3].tokenType == VaultCash
  // Vault burns debt balance
  ) && (
    w[4].transferType == Burn &&
    w[4].fromSystemAccount == Vault &&
    w[4].tokenType == fCash
  ) && (
    w[5].transferType == Burn &&
    w[5].fromSystemAccount == Vault &&
    w[5].tokenType == fCash
  )
}

const vault_secondary_borrow = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Mint &&
    w[0].toSystemAccount == Vault &&
    (w[0].tokenType == fCash || w[0].tokenType == PrimeDebt)
  ) && (
    w[1].transferType == Mint &&
    w[1].toSystemAccount == Vault &&
    (w[1].tokenType == fCash || w[1].tokenType == PrimeCash)
  ) && (
    w[2].transferType == Mint &&
    w[2].tokenType == VaultDebt
  ) && (
    // All values above are in the same underlying
    w[1].underlying == w[2].underlying &&
    w[2].underlying == w[3].underlying
  ) && (
    // Secondary borrows are not followed by minting vault shares
    w[3].tokenType != VaultShare
  )
}

const vault_secondary_deposit = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Mint &&
    w[0].tokenType == PrimeCash &&
    w[0].toSystemAccount == Vault
  )

}

const vault_secondary_repay = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Burn &&
    w[0].toSystemAccount == Vault &&
    (w[0].tokenType == fCash || w[0].tokenType == PrimeDebt)
  ) && (
    w[1].transferType == Burn &&
    w[1].toSystemAccount == Vault &&
    (w[1].tokenType == fCash || w[1].tokenType == PrimeCash)
  ) && (
    w[2].transferType == Burn &&
    w[2].tokenType == VaultDebt
  ) && (
    // All values above are in the same underlying
    w[1].underlying == w[2].underlying &&
    w[2].underlying == w[3].underlying
  ) && (
    // Secondary repays are not followed by minting vault shares
    w[3].tokenType != VaultShare
  )
}

const vault_secondary_settle = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Burn &&
    w[0].tokenType == VaultDebt &&
    w[0].maturity <= w[0].timestamp
  ) && (
    w[1].transferType == Mint &&
    w[1].tokenType == VaultDebt &&
    w[1].maturity == PRIME_CASH_VAULT_MATURITY
  ) && (
    w[0].from == w[1].to &&
    w[0].underlying == w[1].underlying
  )
}

const vault_withdraw_cash = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == _Transfer &&
    w[0].fromSystemAccount == Vault &&
    w[0].tokenType == PrimeCash &&
    w[0].toSystemAccount == None
  ) && (
    w[1].transferType == Burn &&
    w[1].fromSystemAccount == None &&
    w[1].tokenType == PrimeCash
  )
}

const vault_burn_cash = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == _Transfer &&
    w[0].tokenType == VaultCash
  )
}

const vault_liquidate_excess_cash = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == _Transfer &&
    w[0].tokenType == PrimeCash &&
    w[0].fromSystemAccount == Vault
  ) && (
    w[1].transferType == Burn &&
    w[1].tokenType == PrimeCash &&
    w[1].fromSystemAccount == None
  ) && (
    w[2].transferType == Burn &&
    w[2].tokenType == VaultCash
  ) && (
    w[3].transferType == Mint &&
    w[3].tokenType == PrimeCash &&
    w[3].fromSystemAccount == None
  ) && (
    w[4].transferType == _Transfer &&
    w[4].tokenType == PrimeCash &&
    w[4].toSystemAccount == Vault
  ) && (
    w[5].transferType == Mint &&
    w[5].tokenType == VaultCash
  )
}

const vault_settle_cash = (w: Transfer[]): boolean => {
  return (
    w[0].transferType == Burn &&
    w[0].tokenType == VaultCash
  ) && (
    w[1].transferType == Mint &&
    w[1].tokenType == VaultCash &&
    w[1].maturity == PRIME_CASH_VAULT_MATURITY
  )

}

export const BundleCriteria = new Array<Criteria>();
const CAN_START = true;
const REWRITE = true;

BundleCriteria.push(new Criteria("Deposit", 1, deposit, 1, CAN_START));
BundleCriteria.push(new Criteria("Mint pCash Fee", 1, mint_pcash_fee));
BundleCriteria.push(new Criteria("Withdraw", 1, withdraw, 1, CAN_START));
BundleCriteria.push(
  new Criteria("Deposit and Transfer", 1, deposit_transfer, 1, CAN_START, REWRITE)
);
BundleCriteria.push(new Criteria("Transfer Asset", 1, transfer_asset));
BundleCriteria.push(new Criteria("Transfer Incentive", 1, transfer_incentive));
BundleCriteria.push(new Criteria("Vault Entry Transfer", 1, vault_entry_transfer, 1));
// This is a secondary vault entry transfer
BundleCriteria.push(new Criteria("Vault Entry Transfer", 2, vault_entry_transfer, 1, false, false, 1));
BundleCriteria.push(
  new Criteria("nToken Purchase Negative Residual", 4, ntoken_purchase_negative_residual, 1)
);
BundleCriteria.push(
  new Criteria("nToken Purchase Positive Residual", 2, ntoken_purchase_positive_residual, 1)
);
BundleCriteria.push(new Criteria("nToken Residual Transfer", 1, ntoken_residual_transfer, 1));

BundleCriteria.push(new Criteria("Settle Cash", 1, settle_cash));
BundleCriteria.push(new Criteria("Settle fCash", 1, settle_fcash));
BundleCriteria.push(new Criteria("Settle Cash nToken", 1, settle_cash_ntoken));
BundleCriteria.push(new Criteria("Settle fCash nToken", 1, settle_fcash_ntoken));
BundleCriteria.push(new Criteria("Settle Cash Vault", 1, settle_cash_vault));
BundleCriteria.push(new Criteria("Settle fCash Vault", 1, settle_fcash_vault));

BundleCriteria.push(new Criteria("Borrow Prime Cash", 2, borrow_prime_cash));
BundleCriteria.push(new Criteria("Global Settlement", 2, global_settlement));
BundleCriteria.push(new Criteria("Repay Prime Cash", 2, repay_prime_cash));
BundleCriteria.push(new Criteria("Borrow Prime Cash Vault", 2, borrow_prime_cash_vault));
BundleCriteria.push(new Criteria("Repay Prime Cash Vault", 2, repay_prime_cash_vault));
BundleCriteria.push(new Criteria("Borrow fCash", 2, borrow_fcash));
BundleCriteria.push(new Criteria("Repay fCash", 2, repay_fcash));
BundleCriteria.push(new Criteria("Borrow fCash Vault", 2, borrow_fcash_vault));
BundleCriteria.push(new Criteria("Repay fCash Vault", 2, repay_fcash_vault));
BundleCriteria.push(new Criteria("nToken Add Liquidity", 2, ntoken_add_liquidity));
BundleCriteria.push(new Criteria("nToken Remove Liquidity", 2, ntoken_remove_liquidity));
BundleCriteria.push(new Criteria("Mint nToken", 2, mint_ntoken));
BundleCriteria.push(new Criteria("Redeem nToken", 2, redeem_ntoken));

BundleCriteria.push(new Criteria("Buy fCash", 3, buy_fcash));
BundleCriteria.push(new Criteria("Buy fCash Vault", 3, buy_fcash_vault));
BundleCriteria.push(new Criteria("nToken Deleverage", 3, ntoken_deleverage));
BundleCriteria.push(new Criteria("Sell fCash", 3, sell_fcash));
BundleCriteria.push(new Criteria("Sell fCash Vault", 3, sell_fcash_vault));

BundleCriteria.push(new Criteria("Vault Fees", 2, vault_fees));
BundleCriteria.push(new Criteria("Vault Redeem", 3, vault_redeem));
BundleCriteria.push(new Criteria("Vault Lend at Zero", 4, vault_lend_at_zero));

BundleCriteria.push(new Criteria("Vault Roll", 2, vault_roll, 2, false, REWRITE));
BundleCriteria.push(new Criteria("Vault Entry", 2, vault_entry, 2));
BundleCriteria.push(new Criteria("Vault Exit", 2, vault_exit));
BundleCriteria.push(new Criteria("Vault Settle", 2, vault_settle, 2, false, REWRITE));
BundleCriteria.push(new Criteria("Vault Deleverage fCash", 2, vault_deleverage_fcash));
BundleCriteria.push(new Criteria("Vault Deleverage Prime Debt", 2, vault_deleverage_prime_debt));
BundleCriteria.push(new Criteria("Vault Liquidate Cash", 6, vault_liquidate_cash));
BundleCriteria.push(new Criteria("Vault Withdraw Cash", 2, vault_withdraw_cash));
BundleCriteria.push(new Criteria("Vault Burn Cash", 1, vault_burn_cash));
BundleCriteria.push(new Criteria("Vault Settle Cash", 1, vault_settle_cash, 1, false, REWRITE));

BundleCriteria.push(
  new Criteria("Vault Secondary Borrow", 2, vault_secondary_borrow, 2, false, false, 1)
);
BundleCriteria.push(
  new Criteria("Vault Secondary Repay", 2, vault_secondary_repay, 2, false, false, 1)
);
BundleCriteria.push(new Criteria("Vault Secondary Settle", 2, vault_secondary_settle));
BundleCriteria.push(new Criteria("Vault Liquidate Excess Cash", 1, vault_liquidate_excess_cash, 5, false, REWRITE));