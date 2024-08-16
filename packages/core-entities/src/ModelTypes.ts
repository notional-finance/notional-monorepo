import { Network } from '@notional-finance/util';
import { types } from 'mobx-state-tree';
import { SerializedTokenBalance, TokenBalance } from './token-balance';
import { BigNumber } from 'ethers';
import FixedPoint from './exchanges/BalancerV2/fixed-point';
import {
  SerializedTokenDefinition,
  SystemAccount,
  TokenDefinition,
  TokenInterface,
  TokenType,
} from './Definitions';

export const NotionalTypes = {
  Network: types.enumeration<Network>('Network', Object.values(Network)),
  TokenType: types.enumeration<TokenType>('TokenType', [
    'Underlying',
    'nToken',
    'WrappedfCash',
    'PrimeCash',
    'PrimeDebt',
    'fCash',
    'VaultShare',
    'VaultDebt',
    'VaultCash',
    'NOTE',
    'Fiat',
  ]),
  TokenInterface: types.enumeration<TokenInterface>('TokenInterface', [
    'ERC20',
    'ERC1155',
    'FIAT',
  ]),
  SystemAccount: types.enumeration<SystemAccount>('SystemAccount', [
    'None',
    'ZeroAddress',
    'FeeReserve',
    'SettlementReserve',
    'Vault',
    'nToken',
    'PrimeCash',
    'PrimeDebt',
    'Notional',
    'NOTE',
    'SecondaryIncentiveRewarder',
  ]),
  BigNumber: types.custom<{ type: 'BigNumber'; hex: string }, BigNumber>({
    name: 'BigNumber',
    fromSnapshot(value) {
      return BigNumber.from(value.hex);
    },
    toSnapshot(value) {
      return value.toJSON();
    },
    isTargetType(value): boolean {
      if (value instanceof BigNumber) return true;
      return false;
    },
    getValidationMessage(snapshot) {
      if (snapshot.type !== 'BigNumber') return 'not big number';
      if (snapshot.hex === undefined) return 'hex is required';
      return '';
    },
  }),
  FixedPoint: types.custom<ReturnType<FixedPoint['toJSON']>, FixedPoint>({
    name: 'FixedPoint',
    fromSnapshot(value) {
      return FixedPoint.fromJSON(value);
    },
    toSnapshot(value) {
      return value.toJSON();
    },
    isTargetType(value): boolean {
      if (value instanceof FixedPoint) return true;
      return false;
    },
    getValidationMessage(snapshot) {
      if (snapshot._isFixedPoint === false) return 'not fixed point';
      if (snapshot._hex === undefined) return 'hex is required';
      return '';
    },
  }),
  TokenBalance: types.custom<SerializedTokenBalance, TokenBalance>({
    name: 'TokenBalance',
    fromSnapshot(value) {
      return TokenBalance.fromJSON(value);
    },
    toSnapshot(value) {
      return value.toJSON();
    },
    isTargetType(value): boolean {
      if (value instanceof TokenBalance) return true;
      return false;
    },
    getValidationMessage(snapshot) {
      if (snapshot._isTokenBalance === false) return 'not token balance';
      if (snapshot.network === undefined) return 'network is required';
      if (snapshot.tokenId === undefined) return 'tokenId is required';
      if (snapshot.hex === undefined) return 'hex is required';
      return '';
    },
  }),
  TokenDefinition: types.custom<SerializedTokenDefinition, TokenDefinition>({
    name: 'TokenDefinition',
    fromSnapshot(value) {
      return {
        ...value,
        totalSupply: value.totalSupply
          ? TokenBalance.fromJSON(value.totalSupply)
          : undefined,
      } as TokenDefinition;
    },
    toSnapshot(value) {
      return {
        ...value,
        totalSupply: value.totalSupply?.toJSON(),
      } as SerializedTokenDefinition;
    },
    isTargetType(): boolean {
      return true;
    },
    getValidationMessage() {
      return '';
    },
  }),
};

const AccountIncentiveDebtModel = types.model('AccountIncentiveDebt', {
  value: NotionalTypes.TokenBalance,
  currencyId: types.number,
});

const BalanceStatementModel = types.model('BalanceStatement', {
  token: NotionalTypes.TokenDefinition,
  blockNumber: types.number,
  underlying: types.late(() => NotionalTypes.TokenDefinition),
  currentBalance: NotionalTypes.TokenBalance,
  adjustedCostBasis: NotionalTypes.TokenBalance,
  totalILAndFees: NotionalTypes.TokenBalance,
  totalProfitAndLoss: NotionalTypes.TokenBalance,
  totalInterestAccrual: NotionalTypes.TokenBalance,
  accumulatedCostRealized: NotionalTypes.TokenBalance,
  incentives: types.array(
    types.model({
      totalClaimed: NotionalTypes.TokenBalance,
      adjustedClaimed: NotionalTypes.TokenBalance,
    })
  ),
  impliedFixedRate: types.maybe(types.number),
});

const AccountHistoryModel = types.model('AccountHistory', {
  label: types.string,
  txnLabel: types.maybe(types.string),
  timestamp: types.number,
  blockNumber: types.number,
  token: NotionalTypes.TokenDefinition,
  underlying: NotionalTypes.TokenDefinition,
  tokenAmount: NotionalTypes.TokenBalance,
  bundleName: types.string,
  transactionHash: types.string,
  underlyingAmountRealized: NotionalTypes.TokenBalance,
  underlyingAmountSpot: NotionalTypes.TokenBalance,
  realizedPrice: NotionalTypes.TokenBalance,
  spotPrice: NotionalTypes.TokenBalance,
  vaultName: types.maybe(types.string),
  impliedFixedRate: types.maybe(types.number),
  isTransientLineItem: types.boolean,
  account: types.maybe(types.string),
});

export const AccountModel = types.model('Account', {
  address: types.string,
  network: NotionalTypes.Network,
  balances: types.array(NotionalTypes.TokenBalance),
  allowPrimeBorrow: types.maybe(types.boolean),
  vaultLastUpdateTime: types.maybe(types.map(types.number)),
  accountIncentiveDebt: types.maybe(types.array(AccountIncentiveDebtModel)),
  secondaryIncentiveDebt: types.maybe(types.array(AccountIncentiveDebtModel)),
  balanceStatement: types.maybe(types.array(BalanceStatementModel)),
  accountHistory: types.maybe(types.array(AccountHistoryModel)),
  allowances: types.maybe(
    types.array(
      types.model({
        spender: types.string,
        amount: NotionalTypes.TokenBalance,
      })
    )
  ),
  systemAccountType: NotionalTypes.SystemAccount,
  stakeNOTEStatus: types.maybe(
    types.model({
      inCoolDown: types.boolean,
      inRedeemWindow: types.boolean,
      redeemWindowBegin: types.number,
      redeemWindowEnd: types.number,
    })
  ),
  historicalBalances: types.maybe(
    types.array(
      types.model({
        timestamp: types.number,
        balance: NotionalTypes.TokenBalance,
      })
    )
  ),
});
