import { utils } from 'ethers';
import { ReturnsBreakdown, StakedNoteHistory, TransactionHistory, TypedBigNumber } from '..';
import { INTERNAL_TOKEN_PRECISION, NOTE_CURRENCY_ID, STAKED_NOTE_CURRENCY_ID } from '../config/constants';
import { getNowSeconds } from '../libs/utils';
import { StakedNote } from '../staking';
import { NTokenValue, System } from '../system';
import Account from './Account';
import AccountData from './AccountData';

export default class NOTESummary {
  public get hashKey() {
    return utils.id(`${this.NOTEBalance.toString()}:${this.sNOTEBalance.toString()}`);
  }

  public static async build(account: Account) {
    const accountData = account.accountData || AccountData.emptyAccountData();
    if (!accountData.accountHistory) {
      await accountData.fetchHistory(account.address);
    }
    const noteBalance = await System.getSystem().getNOTE().balanceOf(account.address);
    const sNoteBalance = await System.getSystem().getStakedNote().balanceOf(account.address);

    return new NOTESummary(
      TypedBigNumber.fromBalance(noteBalance, 'NOTE', false),
      TypedBigNumber.fromBalance(sNoteBalance, 'sNOTE', false),
      accountData,
      accountData.accountHistory!.sNOTEHistory
    );
  }

  constructor(
    private NOTEBalance: TypedBigNumber,
    private sNOTEBalance: TypedBigNumber,
    private accountData: AccountData,
    public stakedNoteHistory: StakedNoteHistory
  ) {}

  /**
   * @returns Total value of Staked NOTE in NOTE terms.
   */
  public getStakedNoteValue(): TypedBigNumber {
    if (this.sNOTEBalance.isZero()) return TypedBigNumber.fromBalance(0, 'NOTE', false);
    const { ethClaim, noteClaim } = StakedNote.getRedemptionValue(this.sNOTEBalance);
    return ethClaim.toInternalPrecision().fromETH(NOTE_CURRENCY_ID, false).add(noteClaim);
  }

  /**
   * @returns Total NOTE value of sNOTE, NOTE and unclaimed NOTE.
   */
  public getTotalNoteValue(): TypedBigNumber {
    const { unclaimedNOTE } = this.getUnclaimedNOTE();
    return this.getStakedNoteValue().add(this.NOTEBalance).add(unclaimedNOTE);
  }

  public getReturnsBreakdown(): ReturnsBreakdown[] {
    const returnsBreakdown: ReturnsBreakdown[] = [];

    if (this.sNOTEBalance.isPositive()) {
      const { interestEarned, realizedYield } = this.getStakedNoteReturns();
      returnsBreakdown.push({
        source: 'sNOTE',
        balance: this.sNOTEBalance,
        value: this.getStakedNoteValue(),
        interestEarned,
        realizedYield,
      });
    }

    if (this.NOTEBalance.isPositive()) {
      returnsBreakdown.push({
        source: 'NOTE',
        balance: this.NOTEBalance,
        value: this.NOTEBalance,
      });
    }

    const { unclaimedNOTE, rateOfChangePerSecond } = this.getUnclaimedNOTE();
    if (unclaimedNOTE.isPositive()) {
      returnsBreakdown.push({
        source: 'Unclaimed NOTE',
        balance: unclaimedNOTE,
        value: unclaimedNOTE,
        rateOfChangePerSecond,
      });
    }

    return returnsBreakdown;
  }

  public static getTransactionHistory(stakedNoteHistory?: StakedNoteHistory): TransactionHistory[] {
    if (!stakedNoteHistory) return [];

    return stakedNoteHistory.transactions.map((h) => {
      let txnType = 'unknown';
      if (h.sNOTEAmountBefore.lt(h.sNOTEAmountAfter)) {
        txnType = 'Stake NOTE';
      } else if (h.sNOTEAmountBefore.gt(h.sNOTEAmountAfter)) {
        txnType = 'Unstake NOTE';
      }

      return {
        currencyId: STAKED_NOTE_CURRENCY_ID,
        txnType,
        timestampMS: h.blockTime.getTime(),
        transactionHash: h.transactionHash,
        amount: h.sNOTEAmountAfter.sub(h.sNOTEAmountBefore).abs(),
      };
    });
  }

  public getTransactionHistory(): TransactionHistory[] {
    return NOTESummary.getTransactionHistory(this.stakedNoteHistory);
  }

  private getStakedNoteReturns() {
    const currentStakedNoteValue = this.getStakedNoteValue();
    if (currentStakedNoteValue.isZero()) {
      return { interestEarned: undefined, realizedYield: undefined };
    }

    const { ethAmountJoined, ethAmountRedeemed, noteAmountJoined, noteAmountRedeemed } = this.stakedNoteHistory;

    const amountJoinedInNote = ethAmountJoined.fromETH(NOTE_CURRENCY_ID, false).add(noteAmountJoined);
    const amountRedeemedInNote = ethAmountRedeemed.fromETH(NOTE_CURRENCY_ID, false).add(noteAmountRedeemed);

    // If amountJoinedInNote > amountRedeemedInNote then the user has both principal and interest in the token
    // If amountJoinedInNote < amountRedeemedInNote then the user has no principal and only interest in the token

    // If currentStakedNoteValue - netCostBasis > 0 then the user has interest earned
    // If currentStakedNoteValue - netCostBasis < 0 then the user has redeemed all their value

    const netCostBasis = amountJoinedInNote.sub(amountRedeemedInNote);
    const interestEarned = currentStakedNoteValue.sub(netCostBasis);
    let realizedYield: number | undefined;

    if (interestEarned.isNegative()) {
      // It doesn't make sense for interest earned to be negative (since all the FX is done at current rates),
      // so we return undefined here
      return { interestEarned: undefined, realizedYield: undefined };
    }

    if (netCostBasis.isPositive()) {
      // The yield here is calculated as an absolute rate of return (not annualized)
      realizedYield =
        ((currentStakedNoteValue.n.div(netCostBasis.n).toNumber() - INTERNAL_TOKEN_PRECISION) /
          INTERNAL_TOKEN_PRECISION) *
        100;
    }

    return { interestEarned, realizedYield };
  }

  private getUnclaimedNOTE() {
    const startingTime = getNowSeconds();
    const currentUnclaimedNOTE = this.accountData.accountBalances.reduce((note, balance) => {
      if (balance.nTokenBalance?.isPositive()) {
        return note.add(
          NTokenValue.getClaimableIncentives(
            balance.currencyId,
            balance.nTokenBalance,
            balance.lastClaimTime,
            balance.accountIncentiveDebt,
            startingTime
          )
        );
      }
      return note;
    }, TypedBigNumber.fromBalance(0, 'NOTE', false));

    const unclaimedNOTEIn5Min = this.accountData.accountBalances.reduce((note, balance) => {
      if (balance.nTokenBalance?.isPositive()) {
        return note.add(
          NTokenValue.getClaimableIncentives(
            balance.currencyId,
            balance.nTokenBalance,
            balance.lastClaimTime,
            balance.accountIncentiveDebt,
            startingTime + 300
          )
        );
      }
      return note;
    }, TypedBigNumber.fromBalance(0, 'NOTE', false));

    return {
      unclaimedNOTE: currentUnclaimedNOTE,
      rateOfChangePerSecond: unclaimedNOTEIn5Min.sub(currentUnclaimedNOTE).toNumber() / 300,
    };
  }
}
