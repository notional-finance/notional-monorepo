import {
  ConnectContestWallet,
  ContestConfirmation,
  CommunityPartners,
  StepLoading,
  MintPass,
} from '../components/contest-sign-up-steps';
import { CONTEST_SIGN_UP_STEPS } from '@notional-finance/util';
import {
  useAccountReady,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { useHistory, useParams } from 'react-router-dom';
import { useEffect } from 'react';

export interface ContestSignUpParams {
  step?: CONTEST_SIGN_UP_STEPS;
}

const ContestSteps = {
  [CONTEST_SIGN_UP_STEPS.CONNECT_WALLET]: ConnectContestWallet,
  [CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS]: CommunityPartners,
  [CONTEST_SIGN_UP_STEPS.MINT_PASS]: MintPass,
  [CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION]: ContestConfirmation,
};

export const useSignUpStep = () => {
  const params = useParams<ContestSignUpParams>();
  const connected = useAccountReady();
  const history = useHistory();
  const {
    globalState: { isAccountPending },
  } = useNotionalContext();
  let CurrentStep = () => <StepLoading />;

  useEffect(() => {
    if (
      connected &&
      !isAccountPending &&
      params.step !== CONTEST_SIGN_UP_STEPS.MINT_PASS &&
      params.step !== CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION
    ) {
      history.push(CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS);
    }
  }, [connected, isAccountPending, history]);

  if (isAccountPending) {
    <StepLoading />;
  } else if (params.step && ContestSteps[params.step]) {
    CurrentStep = ContestSteps[params.step];
  } else {
    <StepLoading />;
  }

  return CurrentStep;
};
