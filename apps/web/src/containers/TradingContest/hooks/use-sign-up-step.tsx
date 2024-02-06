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
  const mintPass = useMintPass();

  useEffect(() => {
    if (
      connected &&
      !isAccountPending &&
      params.step === CONTEST_SIGN_UP_STEPS.CONNECT_WALLET
    ) {
      history.push(CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS);
    }
  }, [connected, isAccountPending, history, params]);

  if (isAccountPending) {
    return () => <StepLoading />;
  } else if (mintPass.transactionStatus === TransactionStatus.CONFIRMED) {
    return ContestSteps[CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION](mintPass);
  } else if (params.step && ContestSteps[params.step]) {
    return ContestSteps[params.step](mintPass);
  } else {
    return () => <StepLoading />;
  }
};
