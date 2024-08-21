import { Network } from '@notional-finance/util';
import { types } from 'mobx-state-tree';
import { SerializedTokenBalance, TokenBalance } from '../token-balance';
import { BigNumber } from 'ethers';
import FixedPoint from '../exchanges/BalancerV2/fixed-point';
import { SystemAccount, TokenInterface, TokenType } from '../Definitions';

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
};

export const TokenDefinitionModel = types.model('TokenDefinition', {
  id: types.identifier,
  address: types.string,
  network: NotionalTypes.Network,
  name: types.string,
  symbol: types.string,
  decimals: types.number,
  tokenInterface: NotionalTypes.TokenInterface,
  tokenType: NotionalTypes.TokenType,
  totalSupply: types.maybe(NotionalTypes.TokenBalance),
  underlying: types.maybe(types.string),
  maturity: types.maybe(types.number),
  vaultAddress: types.maybe(types.string),
  isFCashDebt: types.maybe(types.boolean),
  currencyId: types.maybe(types.number),
});
