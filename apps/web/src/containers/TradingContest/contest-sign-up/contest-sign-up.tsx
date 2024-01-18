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
import { OuterContainer } from '../components';
import { CONTEST_SIGN_UP_STEPS } from '@notional-finance/util';
import { useParams } from 'react-router-dom';
import {
  ConnectContestWallet,
  ContestConfirmation,
  CommunityPartners,
  MintPass,
} from './contest-sign-up-steps';

export interface ContestSignUpParams {
  step?: CONTEST_SIGN_UP_STEPS;
}

const ContestSteps = {
  [CONTEST_SIGN_UP_STEPS.CONNECT_WALLET]: ConnectContestWallet,
  [CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS]: CommunityPartners,
  [CONTEST_SIGN_UP_STEPS.MINT_PASS]: MintPass,
  [CONTEST_SIGN_UP_STEPS.CONTEST_CONFIRMATION]: ContestConfirmation,
};

interface BreadCrumbProps {
  stepActive: boolean;
  theme: NotionalTheme;
}

const ContestBreadCrumb = ({ step }: ContestSignUpParams) => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '530px',
        margin: 'auto',
      }}
    >
      <Box sx={{ width: '150px' }}>
        <BreadCrumb stepActive={true} theme={theme}>
          <FormattedMessage defaultMessage={'Contest Wallet'} />
        </BreadCrumb>
        <BreadCrumbBlock stepActive={true} theme={theme} />
      </Box>
      <Box sx={{ width: '150px' }}>
        <BreadCrumb
          stepActive={
            step === CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS ||
            step === CONTEST_SIGN_UP_STEPS.MINT_PASS
          }
          theme={theme}
        >
          <FormattedMessage defaultMessage={'Community Partners'} />
        </BreadCrumb>
        <BreadCrumbBlock
          stepActive={
            step === CONTEST_SIGN_UP_STEPS.COMMUNITY_PARTNERS ||
            step === CONTEST_SIGN_UP_STEPS.MINT_PASS
          }
          theme={theme}
        />
      </Box>
      <Box sx={{ width: '150px' }}>
        <BreadCrumb
          stepActive={step === CONTEST_SIGN_UP_STEPS.MINT_PASS}
          theme={theme}
        >
          <FormattedMessage defaultMessage={'Mint Pass'} />
        </BreadCrumb>
        <BreadCrumbBlock
          stepActive={step === CONTEST_SIGN_UP_STEPS.MINT_PASS}
          theme={theme}
        />
      </Box>
    </Box>
  );
};

export const ContestSignUp = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const params = useParams<ContestSignUpParams>();
  const CurrentStep =
    params.step && ContestSteps[params.step]
      ? ContestSteps[params.step]
      : () => <div>loading...</div>;

  return (
    <ThemeProvider theme={theme}>
      <OuterContainer>
        <BgImgContainer>
          <img src={backgroundColors} alt="bg img" />
        </BgImgContainer>
        <OpacityBG>
          <ContestBreadCrumb
            step={params.step || CONTEST_SIGN_UP_STEPS.CONNECT_WALLET}
          />
          <CurrentStep />
        </OpacityBG>
      </OuterContainer>
    </ThemeProvider>
  );
};

const BgImgContainer = styled(Box)(
  `
    overflow: hidden;
    position: absolute;
    width: 100vw;
    z-index: 1;
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
    margin-top: ${theme.spacing(20)};
    margin-bottom: ${theme.spacing(23)};
    padding: ${theme.spacing(8)};
    z-index: 3;
    width: 1022px;
    height: 677px;
    text-align: center;
      `
);

export const BreadCrumb = styled(Caption, {
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

export default ContestSignUp;
