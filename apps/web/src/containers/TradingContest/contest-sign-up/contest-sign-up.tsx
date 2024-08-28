import { Box, styled, ThemeProvider } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import {
  colors,
  NotionalTheme,
  useNotionalTheme,
} from '@notional-finance/styles';
import { Caption } from '@notional-finance/mui';
import backgroundColors from '../assets/color-blobs.png';
import {
  CommunityPartners,
  ConnectContestWallet,
  ContestConfirmation,
  OuterContainer,
  StepLoading,
} from '../components';
import MintPass from '../components/contest-sign-up-steps/mint-pass';
import { CONTEST_SIGN_UP_STEPS } from '@notional-finance/util';
import { useParams } from 'react-router-dom';
import { ContestSignUpParams, useSignUpStep } from '../hooks';

interface BreadCrumbProps {
  stepActive: boolean;
  theme: NotionalTheme;
}

const ContestBreadCrumb = ({ step }: ContestSignUpParams) => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  return (
    <BreadCrumbContainer>
      <BreadCrumb>
        <BreadCrumbText stepActive={true} theme={theme}>
          <FormattedMessage defaultMessage={'Connect Wallet'} />
        </BreadCrumbText>
        <BreadCrumbBlock stepActive={true} theme={theme} />
      </BreadCrumb>
      <BreadCrumb>
        <BreadCrumbText
          stepActive={
            step === CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS ||
            step === CONTEST_SIGN_UP_STEPS.MINT_PASS
          }
          theme={theme}
        >
          <FormattedMessage defaultMessage={'Community Partners'} />
        </BreadCrumbText>
        <BreadCrumbBlock
          stepActive={
            step === CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS ||
            step === CONTEST_SIGN_UP_STEPS.MINT_PASS
          }
          theme={theme}
        />
      </BreadCrumb>
      <BreadCrumb>
        <BreadCrumbText
          stepActive={step === CONTEST_SIGN_UP_STEPS.MINT_PASS}
          theme={theme}
        >
          <FormattedMessage defaultMessage={'Mint Pass'} />
        </BreadCrumbText>
        <BreadCrumbBlock
          stepActive={step === CONTEST_SIGN_UP_STEPS.MINT_PASS}
          theme={theme}
        />
      </BreadCrumb>
    </BreadCrumbContainer>
  );
};

export const ContestSignUp = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const params = useParams<ContestSignUpParams>();
  const { currentStep, mintPass } = useSignUpStep();

  return (
    <ThemeProvider theme={theme}>
      <SignUpContainer>
        <BgImgContainer>
          <img src={backgroundColors} alt="bg img" />
        </BgImgContainer>
        <OpacityBG>
          {params.step !== CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION && (
            <ContestBreadCrumb
              step={params.step || CONTEST_SIGN_UP_STEPS.CONNECT_WALLET}
            />
          )}
          {currentStep === CONTEST_SIGN_UP_STEPS.CONNECT_WALLET ? (
            <ConnectContestWallet />
          ) : currentStep === CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS ? (
            <CommunityPartners {...mintPass} />
          ) : currentStep === CONTEST_SIGN_UP_STEPS.MINT_PASS ? (
            <MintPass {...mintPass} />
          ) : currentStep === CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION ? (
            <ContestConfirmation {...mintPass} />
          ) : (
            <StepLoading />
          )}
        </OpacityBG>
      </SignUpContainer>
    </ThemeProvider>
  );
};

export const SignUpContainer = styled(OuterContainer)(
  ({ theme }) => `
      height: 100vh;
      ${theme.breakpoints.down('sm')} {
        height: 100%;
      }
      `
);

const BgImgContainer = styled(Box)(
  `
    overflow: hidden;
    position: absolute;
    width: 100vw;
    z-index: 1;
    margin-top: -250px;
    img {
      width: 100%;
      height: 100vh;
    }
      `
);

export const OpacityBG = styled(Box)(
  ({ theme }) => `
    background: rgba(4, 29, 46, 0.7);
    border: 1px solid ${colors.greenGrey};
    border-radius: 20px;
    position: relative;
    margin: auto;
    margin-bottom: ${theme.spacing(23)};
    padding: ${theme.spacing(8)};
    z-index: 3;
    width: 1000px;
    height: ${theme.spacing(74)};;
    text-align: center;
    ${theme.breakpoints.down('md')} {
      width: 90%;
      height: 100%;
      margin: auto;
    }
    ${theme.breakpoints.down('sm')} {
      max-height: 100%;
      min-height: 100%;
      height: 100vh;
      width: 100vw;
      border: none;
      padding: ${theme.spacing(2)};
      padding-top: ${theme.spacing(8)};
    }
      `
);

export const BreadCrumb = styled(Box)(
  ({ theme }) => `
      width: 150px;
      ${theme.breakpoints.down('sm')} {
        width: auto;
      }
      `
);

export const BreadCrumbText = styled(Caption, {
  shouldForwardProp: (prop: string) => prop !== 'stepActive',
})(
  ({ theme, stepActive }: BreadCrumbProps) => `
    font-weight: 500;
    color: ${stepActive ? colors.neonTurquoise : colors.matteGreen};
    padding-bottom: ${theme.spacing(1)};
      `
);

export const BreadCrumbBlock = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'stepActive',
})(
  ({ theme, stepActive }: BreadCrumbProps) => `
    width: 100%;
    height: ${theme.spacing(1)};
    background: ${stepActive ? colors.neonTurquoise : colors.matteGreen};
      `
);
export const BreadCrumbContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
    width: 530px;
    margin: auto;
    ${theme.breakpoints.down('sm')} {
      width: 100%;
      justify-content: space-around;
    }
    `
);

export default ContestSignUp;
