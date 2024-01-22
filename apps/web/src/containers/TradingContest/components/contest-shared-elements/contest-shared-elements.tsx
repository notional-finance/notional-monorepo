import { colors } from '@notional-finance/styles';
import { BodySecondary } from '@notional-finance/mui';
import { Box, styled } from '@mui/material';

export const TitleText = styled(Box)(
  ({ theme }) => `
      color: ${colors.white};
      font-family: Avenir Next;
      font-size: 48px;
      font-style: normal;
      font-weight: 600;
      line-height: 67.2px;
      ${theme.breakpoints.down('sm')} {
        font-size: 32px;
        line-height: 42px;
        margin: 0px;
        margin-bottom: ${theme.spacing(4)};
      }
          `
);

export const ContestBodyText = styled(BodySecondary)(`
    color: ${colors.greenGrey};
    max-width: 700px;
    margin: auto;
    font-family: Avenir Next;
`);

export const SectionTitle = styled(Box)(
  ({ theme }) => `
    color: ${colors.white};
    text-align: left;
    font-family: Avenir Next;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    letter-spacing: 10px;
    text-transform: uppercase;
    margin-bottom: ${theme.spacing(4)};
    ${theme.breakpoints.down('md')} {
      text-align: center;
      text-wrap: nowrap;
      letter-spacing: 5px;
    }
    ${theme.breakpoints.down('sm')} {
      flex-direction: column;
      text-wrap: wrap;
      margin-bottom: 0px;

    }
  `
);

export const OuterContainer = styled(Box)(
  ({ theme }) => `
  background: #041D2E; 
  height: 100%;
  padding-top: ${theme.spacing(16)};
  padding-bottom: ${theme.spacing(16)};
  ${theme.breakpoints.down('sm')} {
    padding-top: ${theme.spacing(5)};
  }
    `
);

export const StepContainer = styled(Box)(
  ({ theme }) => `
    height: 92%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    ${theme.breakpoints.down('sm')} {
      margin-top: ${theme.spacing(8)};
      justify-content: normal;
      min-height: 400px;
    }
  `
);

export const BgImgContainer = styled(Box)(`
  overflow: hidden;
  position: absolute;
  width: 100vw;
  z-index: 1;
  img {
    width: 100%;
    height: 100vh;
  }
    `);

export const MainContainer = styled(Box)(
  ({ theme }) => `
  background: transparent;
  height: 100%;
  overflow: hidden;
  max-width: 1230px;
  margin: auto;
  position: relative;
  z-index: 3;
  @media (max-width: 1280px) {
    max-width: 1100px;
  }
  ${theme.breakpoints.down('md')} {
    max-width: 90%;
    margin: auto;
  }
    `
);
