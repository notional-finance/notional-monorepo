import { CONTEST_SIGN_UP_STEPS } from '@notional-finance/util';
import {
  TransactionStatus,
  useAccountReady,
  useNotionalContext,
  useMintPass,
  useSelectedNetwork
} from '@notional-finance/notionable-hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export interface ContestSignUpParams extends Record<string, string | undefined> {
  step?: CONTEST_SIGN_UP_STEPS;
}

export const useSignUpStep = () => {
  const params = useParams<ContestSignUpParams>();
  const network = useSelectedNetwork();
  const navigate = useNavigate();
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
      navigate(CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS);
    } else if (
      mintPass.transactionStatus === TransactionStatus.CONFIRMED &&
      params.step !== CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION
    ) {
      navigate(CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION);
    }
  }, [
    connected,
    isAccountPending,
    navigate,
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
