import { CONTEST_SIGN_UP_STEPS } from '@notional-finance/util';
import {
  TransactionStatus,
  useAccountReady,
  useMintPass,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export interface ContestSignUpParams
  extends Record<string, string | undefined> {
  step?: CONTEST_SIGN_UP_STEPS;
}

export const useSignUpStep = () => {
  const params = useParams<ContestSignUpParams>();
  const network = useSelectedNetwork();
  const navigate = useNavigate();
  const connected = useAccountReady(network);
  const mintPass = useMintPass();

  useEffect(() => {
    if (connected && params.step === CONTEST_SIGN_UP_STEPS.CONNECT_WALLET) {
      navigate(CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS);
    } else if (
      mintPass.transactionStatus === TransactionStatus.CONFIRMED &&
      params.step !== CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION
    ) {
      navigate(CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION);
    }
  }, [connected, navigate, params, mintPass.transactionStatus]);

  const currentStep: CONTEST_SIGN_UP_STEPS =
    params.step || CONTEST_SIGN_UP_STEPS.LOADING;

  return { currentStep, mintPass };
};
