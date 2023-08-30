import { Network, RATE_PRECISION } from '@notional-finance/util';
import { CacheSchema, SerializedAccountDefinition, TokenBalance } from '..';
import {
  DocumentTypes,
  ServerRegistry,
  TypedDocumentReturnType,
  loadGraphClientDeferred,
} from './server-registry';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BalanceSnapshot, ProfitLossLineItem } from '../.graphclient';
import { BigNumber } from 'ethers';

export type AllConfigurationQuery = TypedDocumentReturnType<
  DocumentTypes['AllAccountsDocument']
>;

export class AccountRegistryServer extends ServerRegistry<SerializedAccountDefinition> {
  /** Returns all the active accounts on the network */
  protected async _refresh(
    network: Network
  ): Promise<CacheSchema<SerializedAccountDefinition>> {
    const { AllAccountsDocument } = await loadGraphClientDeferred();
    return this._fetchUsingGraph(network, AllAccountsDocument, (r) => {
      return r.accounts.reduce((o, a) => {
        const acct = {
          address: a.id,
          network,
          balances:
            a.balances?.map((b) =>
              TokenBalance.toJSON(
                BigNumber.from(b.current.currentBalance),
                b.token.id,
                network
              )
            ) || [],
          balanceStatement: a.balances?.map((b) => {
            if (!b.token.underlying) throw Error('Unknown underlying');

            return this._parseBalanceStatement(
              b.token.id,
              b.token.underlying.id,
              b.current as BalanceSnapshot,
              network
            );
          }),
          accountHistory:
            a.profitLossLineItems?.map((p) =>
              this._parseAccountHistory(p as ProfitLossLineItem, network)
            ) || [],
        };

        return Object.assign(o, { [a.id]: acct });
      }, {});
    });
  }

  private _parseBalanceStatement(
    tokenId: string,
    underlyingId: string,
    snapshot: BalanceSnapshot,
    network: Network
  ) {
    const currentBalance = TokenBalance.toJSON(
      BigNumber.from(snapshot.currentBalance),
      tokenId,
      network
    );
    const adjustedCostBasis = TokenBalance.toJSON(
      BigNumber.from(snapshot.adjustedCostBasis),
      underlyingId,
      network
    );
    return {
      token: tokenId,
      underlying: underlyingId,
      currentBalance,
      adjustedCostBasis,
      totalILAndFees: TokenBalance.toJSON(
        BigNumber.from(snapshot.totalILAndFeesAtSnapshot),
        underlyingId,
        network
      ),
      totalProfitAndLoss: TokenBalance.toJSON(
        BigNumber.from(snapshot.totalProfitAndLossAtSnapshot),
        underlyingId,
        network
      ),
      totalInterestAccrual: TokenBalance.toJSON(
        BigNumber.from(snapshot.totalInterestAccrualAtSnapshot),
        underlyingId,
        network
      ),
      impliedFixedRate: snapshot.impliedFixedRate
        ? (snapshot.impliedFixedRate * 100) / RATE_PRECISION
        : undefined,
    };
  }

  private _parseAccountHistory(p: ProfitLossLineItem, network: Network) {
    const token = p.token.id;
    const underlying = p.underlyingToken.id;
    const amount =
      p.token.tokenType === 'PrimeDebt'
        ? BigNumber.from(p.tokenAmount).mul(-1)
        : BigNumber.from(p.tokenAmount);
    const tokenAmount = TokenBalance.toJSON(amount, token, network);

    const underlyingAmountRealized = TokenBalance.toJSON(
      amount.isNegative()
        ? BigNumber.from(p.underlyingAmountRealized).mul(-1)
        : BigNumber.from(p.underlyingAmountRealized),
      underlying,
      network
    );
    const underlyingAmountSpot = TokenBalance.toJSON(
      amount.isNegative()
        ? BigNumber.from(p.underlyingAmountSpot).mul(-1)
        : BigNumber.from(p.underlyingAmountSpot),
      underlying,
      network
    );

    return {
      timestamp: p.timestamp,
      token,
      underlying,
      bundleName: p.bundle.bundleName,
      transactionHash: p.transactionHash.id,
      tokenAmount,
      underlyingAmountRealized,
      underlyingAmountSpot,
      realizedPrice: TokenBalance.toJSON(
        BigNumber.from(p.realizedPrice),
        underlying,
        network
      ),
      spotPrice: TokenBalance.toJSON(
        BigNumber.from(p.spotPrice),
        underlying,
        network
      ),
      impliedFixedRate: p.impliedFixedRate
        ? (p.impliedFixedRate * 100) / RATE_PRECISION
        : undefined,
      isTransientLineItem: p.isTransientLineItem,
    };
  }
}
