import { CONTEST_SIGN_UP_STEPS } from '@notional-finance/util';
import { useSelectedNetwork } from '@notional-finance/wallet';
import {
  TransactionStatus,
  useAccountReady,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { useHistory, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useMintPass } from './use-mint-pass';

export interface ContestSignUpParams {
  step?: CONTEST_SIGN_UP_STEPS;
}

export const useSignUpStep = () => {
  const params = useParams<ContestSignUpParams>();
  const network = useSelectedNetwork();
  const history = useHistory();
  const {
    globalState: { isAccountPending },
  } = useNotionalContext();
  const connected = useAccountReady(network);
  const mintPass = useMintPass();

  useEffect(() => {
    if (
      connected &&
      !isAccountPending &&
      params.step === CONTEST_SIGN_UP_STEPS.CONNECT_WALLET
    ) {
      history.push(CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS);
    } else if (
      mintPass.transactionStatus === TransactionStatus.CONFIRMED &&
      params.step !== CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION
    ) {
      history.push(CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION);
    }
  }, [
    connected,
    isAccountPending,
    history,
    params,
    mintPass.transactionStatus,
  ]);

  let currentStep: CONTEST_SIGN_UP_STEPS =
    params.step || CONTEST_SIGN_UP_STEPS.LOADING;
  if (isAccountPending) {
    currentStep = CONTEST_SIGN_UP_STEPS.LOADING;
  }

  return { currentStep, mintPass };
};
