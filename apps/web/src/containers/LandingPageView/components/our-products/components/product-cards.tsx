import { ReactNode } from 'react';
import { Box, styled } from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import { colors, NotionalTheme } from '@notional-finance/styles';
import { useNotionalTheme } from '@notional-finance/styles';
import { ArrowRightIcon } from '@notional-finance/icons';
import { Link } from 'react-router-dom';
import { H3, Body } from '@notional-finance/mui';
import cardBG from '../assets/card_bg.svg';
import { useAppState } from '@notional-finance/notionable-hooks';

export interface CardStyleProps {
  theme: NotionalTheme;
}
export interface ProductCardsProps {
  title: ReactNode;
  link: string;
  text: ReactNode;
  pillOne: ReactNode;
  linkTitle: ReactNode;
  pillTwo?: ReactNode;
  lottieFile: any;
}

export const ProductCards = ({
  title,
  link,
  text,
  pillOne,
  pillTwo,
  linkTitle,
  lottieFile,
}: ProductCardsProps) => {
  const { themeVariant } = useAppState();
  const theme = useNotionalTheme(themeVariant, 'landing');

  return (
    <MainContainer>
      <CardContainer className="box" to={link} theme={theme}>
        <Box sx={{ marginTop: theme.spacing(4) }}>
          <Player
            autoplay
            loop
            id="lottie-player"
            src={lottieFile}
            style={{
              width: link.includes('borrow') ? '178px' : '158px',
              height: link.includes('borrow') ? '198px' : '178px',
            }}
          />
        </Box>
        <CardContent
          className="box-two"
          sx={{
            transform: link.includes('borrow')
              ? 'translateY(-68px)'
              : 'translateY(-48px)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <H3>{title}</H3>
            <Box sx={{ display: 'flex' }}>
              <Pill>{pillOne}</Pill>
              {pillTwo && <Pill>{pillTwo}</Pill>}
            </Box>
          </Box>
          <Body
            sx={{
              marginTop: theme.spacing(1),
              fontSize: theme.spacing(2),
              marginBottom: theme.spacing(3.5),
            }}
          >
            {text}
          </Body>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: colors.neonTurquoise,
              textDecoration: 'underline',
            }}
          >
            {linkTitle}
            <ArrowRightIcon sx={{ marginLeft: theme.spacing(2) }} />
          </Box>
        </CardContent>
      </CardContainer>
    </MainContainer>
  );
};

const MainContainer = styled(Box)(
  ({ theme }) => `
      min-height: ${theme.spacing(40)};
      min-width: ${theme.spacing(44.25)};
      height: ${theme.spacing(40)};
      width: ${theme.spacing(44.25)};
      background: #041D2E;
      position: relative;
      overflow: hidden;
      z-index: 2;
      display: flex;
      justify-content: center;
      border-radius: ${theme.shape.borderRadius()};
      .box, .box-two {
        position: relative;
      }
      .box::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: ${theme.shape.borderRadius()}; 
        padding: 1.5px; 
        background: linear-gradient(to top, rgba(0, 0, 0, 0) 50%, #13BBC2 100%); 
        -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude; 
      }
      .box-two::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: ${theme.shape.borderRadius()};
        padding: 1.5px; 
        background: linear-gradient(to top, rgba(0, 0, 0, 0) 70%, #13BBC2 100%); 
        -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude; 
      }
    `
);

const CardContainer = styled(Link)(
  ({ theme }: CardStyleProps) => `
      display: block;
      cursor: pointer;
      position: relative;
      margin-top: ${theme.spacing(1)};
      min-height: ${theme.spacing(40)};
      min-width: ${theme.spacing(42)};
      height: ${theme.spacing(40)};
      width: ${theme.spacing(42)};
      background-image: url(${cardBG});
      background-repeat: no-repeat;
      z-index: 5;
      overflow: hidden;
      background-origin: border-box;
      background-clip: content-box, border-box;

      ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
        background: ${colors.black};
        height: 100%;
        width: 95%;
        min-height: 100%;
        min-width: 95%;
        h3 {
          font-size: 1.375rem;
        }
        h4 {
          font-size: 1.5rem;
        }
        p {
          margin-bottom: ${theme.spacing(3)};
          font-size: 1rem;
        }
      }
    `
);

const CardContent = styled(Box)(
  ({ theme }) => `
      height: 80%;
      width: 100%;
      padding: ${theme.spacing(3)};
      position: relative;
      z-index: 2;
      padding-bottom: ${theme.spacing(2)};
      display: flex;
      flex-direction: column;
      background: transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(4, 29, 46, 0.70);
      overflow: hidden;
      ${theme.breakpoints.up(theme.breakpoints.values.sm)} {
        &:hover {
          transition: all 0.3s ease;
          transform: translateY(-120px);
        }
      }
      ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
        padding: ${theme.spacing(3)};
        transform: translateY(-30px);
      }
    `
);

const Pill = styled(Box)(
  ({ theme }) => `
      background: rgba(51, 248, 255, 0.15);
      color: ${colors.neonTurquoise};
      border-radius: 20px;
      font-size: 12px;
      padding: ${theme.spacing(0.5)} ${theme.spacing(1.5)};
      margin-right: ${theme.spacing(1)};
      display: inline-block;
      text-align: center;
      height: fit-content;
    `
);

export default ProductCards;
