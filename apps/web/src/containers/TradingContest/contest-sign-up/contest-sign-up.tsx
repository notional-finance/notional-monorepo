import { Box, styled } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/util';
// import { ContestHero, ContestPrizes, ContestPartners } from '../components';
import { colors } from '@notional-finance/styles';
import backgroundColors from '../assets/color-blobs.png';
import { OuterContainer } from '../contest-home/contest-home';
import { FormattedMessage } from 'react-intl';

export const ContestSignUp = () => {
  // const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  return (
    <OuterContainer>
      <BgImgContainer>
        <img src={backgroundColors} alt="bg img" />
      </BgImgContainer>
      <OpacityBG>
        <TitleText>
          <FormattedMessage defaultMessage={'Connect Wallet'} />
        </TitleText>
      </OpacityBG>
    </OuterContainer>
  );
};

const TitleText = styled(Box)(
  ({ theme }) => `
    color: ${colors.white};
    font-family: Avenir Next;
    font-size: 48px;
    font-style: normal;
    font-weight: 600;
    line-height: 67.2px;
    ${theme.breakpoints.down('md')} {
      font-size: 32px;
      margin: ${theme.spacing(0, 2)};
    }
        `
);

const BgImgContainer = styled(Box)(
  `
    margin-top: -270px;
    overflow: hidden;
    position: absolute;
    width: 100vw;
    z-index: 1;
    img {
      width: 100%;
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
      `
);

export default ContestSignUp;
