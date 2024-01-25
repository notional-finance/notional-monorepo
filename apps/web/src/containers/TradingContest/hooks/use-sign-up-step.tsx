import {
  ConnectContestWallet,
  ContestConfirmation,
  CommunityPartners,
  StepLoading,
  MintPass,
} from '../components/contest-sign-up-steps';
import { CONTEST_SIGN_UP_STEPS } from '@notional-finance/util';
import { useSelectedNetwork } from '@notional-finance/wallet';
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
  const network = useSelectedNetwork();
  const history = useHistory();
  const {
    globalState: { isAccountPending },
  } = useNotionalContext();
  const connected = useAccountReady(network);
  let CurrentStep = () => <StepLoading />;

  useEffect(() => {
    if (
      connected &&
      !isAccountPending &&
      params.step === CONTEST_SIGN_UP_STEPS.CONNECT_WALLET
    ) {
      history.push(CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS);
    } else if (!connected && !isAccountPending) {
      history.push(CONTEST_SIGN_UP_STEPS.CONNECT_WALLET);
    }
  }, [connected, isAccountPending, history, params]);

  if (isAccountPending) {
    <StepLoading />;
  } else if (params.step && ContestSteps[params.step]) {
    CurrentStep = ContestSteps[params.step];
  } else {
    <StepLoading />;
  }

  return CurrentStep;
};
