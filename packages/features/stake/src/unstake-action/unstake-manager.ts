import { account$, notional$ } from '@notional-finance/notionable';
import { StakedNote } from '@notional-finance/sdk/src/staking';
import { map, combineLatest, filter, switchMap } from 'rxjs';
import { stakedNoteInputString$ } from './unstake-store';

export const sNoteAmount$ = combineLatest([stakedNoteInputString$, notional$]).pipe(
  filter(([, notional]) => !!notional),
  map(([input, notional]) => notional!.parseInput(input, 'sNOTE', false))
);

const _accountCoolDown$ = account$.pipe(
  filter((a) => !!a),
  switchMap((account) => {
    return StakedNote.accountCoolDown(account!.address);
  })
);

export const accountCoolDown$ = combineLatest([_accountCoolDown$, notional$]).pipe(
  filter(([a, n]) => !!a && !!n),
  map(([accountCoolDown, notional]) => {
    const { coolDownTimeInSeconds, redeemWindowSeconds } =
      notional!.system.getStakedNoteParameters();
    const coolDownTimeMilliseconds = coolDownTimeInSeconds * 1000;
    const formatBeginEstimate = new Date().getTime() + coolDownTimeMilliseconds;
    const formatEndEstimate = formatBeginEstimate + redeemWindowSeconds * 1000;

    const redeemBeginEstimate = new Date(formatBeginEstimate);
    const redeemEndEstimate = new Date(formatEndEstimate);

    const redeemWindowBegin = new Date(accountCoolDown.redeemWindowBegin.toNumber() * 1000);
    const redeemWindowEnd = new Date(accountCoolDown.redeemWindowEnd.toNumber() * 1000);

    return {
      isInCoolDown: accountCoolDown.isInCoolDown,
      redeemWindowBegin:
        accountCoolDown.redeemWindowBegin.toNumber() === 0
          ? redeemBeginEstimate
          : redeemWindowBegin,
      redeemWindowEnd:
        accountCoolDown.redeemWindowBegin.toNumber() === 0 ? redeemEndEstimate : redeemWindowEnd,
      isInRedeemWindow: accountCoolDown.isInRedeemWindow,
    };
  })
);
