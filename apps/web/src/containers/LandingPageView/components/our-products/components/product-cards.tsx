import { useState, ReactNode } from 'react';
import {
  TokenIcon,
  ArrowRightIcon,
  LightningIcon,
} from '@notional-finance/icons';
import { Box, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { colors, NotionalTheme } from '@notional-finance/styles';
import { useNotionalTheme } from '@notional-finance/styles';
import { useThemeVariant } from '@notional-finance/notionable-hooks';
import { Link } from 'react-router-dom';
import {
  H4,
  Subtitle,
  SectionTitle,
  CardInput,
  ProgressIndicator,
} from '@notional-finance/mui';

export interface TestProps {
  isLeveraged: boolean;
  theme: NotionalTheme;
}
export interface ProductCardsProps {
  title: ReactNode;
  link: string;
  text: ReactNode;
  apy: string;
  symbol: string | undefined;
  groupedSymbols: string;
  apyTitle: ReactNode;
  href?: string;
  variableRate?: boolean;
  loading?: boolean;
  isLeveraged?: boolean;
  fixedRate?: boolean;
}

export interface PillProps {
  variableRate: boolean;
  theme: NotionalTheme;
}
export interface CardFooterTextProps {
  hovered: boolean;
  isLeveraged: boolean;
  theme: NotionalTheme;
}

export const ProductCards = ({
  title,
  link,
  href,
  text,
  apy,
  symbol,
  groupedSymbols,
  apyTitle,
  loading,
  isLeveraged = false,
  fixedRate,
}: ProductCardsProps) => {
  const [hovered, setHovered] = useState(false);
  const themeVariant = useThemeVariant();
  const theme = useNotionalTheme(themeVariant, 'landing');

  return (
    <CardContainer
      to={href ? { pathname: href || '' } : link}
      target={href ? '_blank' : ''}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      isLeveraged={isLeveraged}
      theme={theme}
    >
      <CardContent>
        <Box>
          <H4
            sx={{
              color: colors.white,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isLeveraged && (
              <LightningIcon sx={{ marginRight: theme.spacing(1.5) }} />
            )}
            {title}
          </H4>

          <Subtitle
            sx={{
              color: colors.greenGrey,
              marginBottom: theme.spacing(6),
              marginTop: theme.spacing(1),
            }}
          >
            {text}
          </Subtitle>
        </Box>
        <Box>
          <SectionTitle
            sx={{
              letterSpacing: '1px',
              color: colors.greenGrey,
              marginBottom: theme.spacing(1.5),
            }}
          >
            {apyTitle}
          </SectionTitle>
          {!loading && symbol ? (
            <H4
              sx={{
                color: colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <TokenIcon
                  symbol={symbol}
                  size="large"
                  useAccentBorderImg
                  style={{ marginRight: theme.spacing(1.5) }}
                />
                {apy}
              </Box>
              {fixedRate && (
                <Pill>
                  <FormattedMessage defaultMessage={'fixed'} />
                </Pill>
              )}
            </H4>
          ) : (
            <Box sx={{ width: theme.spacing(6) }}>
              <ProgressIndicator />
            </Box>
          )}
        </Box>
      </CardContent>
      <CardFooter isLeveraged={isLeveraged} theme={theme}>
        <CardInput>
          <CardFooterText
            isLeveraged={isLeveraged}
            hovered={hovered}
            theme={theme}
          >
            <FormattedMessage defaultMessage={'View All Currencies'} />
            <ArrowRightIcon
              sx={{
                height: theme.spacing(1.75),
                width: theme.spacing(1.75),
                marginLeft: theme.spacing(2),
                marginBottom: '-2px',
              }}
              fill={isLeveraged ? colors.black : colors.neonTurquoise}
            />
          </CardFooterText>
        </CardInput>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TokenIcon
            symbol={groupedSymbols}
            size="medium"
            style={{ width: '100%' }}
          />
        </Box>
      </CardFooter>
    </CardContainer>
  );
};

const CardContainer = styled(Link, {
  shouldForwardProp: (prop: string) => prop !== 'isLeveraged',
})(
  ({ isLeveraged, theme }: TestProps) => `
      cursor: pointer;
      margin-top: ${theme.spacing(8)};
      min-height: ${theme.spacing(43.125)};
      min-width: ${theme.spacing(45)};
      height: ${theme.spacing(43.125)};
      width: ${theme.spacing(45)};
      border: 1px solid ${isLeveraged ? '#7CABE2' : colors.blueGreen};
      border-radius: ${theme.shape.borderRadius()};
      box-shadow: 0px 34px 50px -15px rgba(51, 248, 255, 0.3);
      transition: all 0.3s ease;
      z-index: 1;
      
      ${theme.gradient.hoverTransition(
        !isLeveraged ? colors.darkGreen : '#1A5467',
        theme.palette.info.light
      )}

      &:hover {
        cursor: pointer;
        box-shadow: ${theme.shape.shadowLarge(colors.purpleGrey)};
        transition: all 0.3s ease;
        transform: scale(1.1);
      }

      ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
        background: ${isLeveraged ? '#1A5467' : colors.black};
        height: 100%;
        width: 100%;
        min-height: 100%;
        min-width: 100%;
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
        box-shadow: 0px 34px 50px -15px rgba(20, 42, 74, 0.3);
      }
    `
);

const CardContent = styled(Box)(
  ({ theme }) => `
      height: 80%;
      padding: ${theme.spacing(4)};
      position: relative;
      z-index: 2;
      height: 80%;
      padding-bottom: ${theme.spacing(2)};
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
        padding: ${theme.spacing(3)};
      }
    `
);

const CardFooter = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'isLeveraged',
})(
  ({ isLeveraged, theme }: TestProps) => `
    background: ${
      isLeveraged
        ? 'linear-gradient(180deg, #2BCAD0 0%, #8BA4E5 100%)'
        : colors.black
    };
    width: 100%;
    height: 20%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing(0, 4)};
    border-radius: ${isLeveraged ? '0px 0px 3px 3px' : '0px 0px 6px 6px'};
    border-top: 1px solid ${colors.blueGreen};
    position: relative;
    z-index: 2;
    ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
      height: ${theme.spacing(7)};
      span {
        font-size: 1rem;
      }
    }
    `
);

const CardFooterText = styled(Box, {
  shouldForwardProp: (prop: string) =>
    prop !== 'isLeveraged' && prop !== 'hovered',
})(
  ({ isLeveraged, hovered, theme }: CardFooterTextProps) => `
    height: fit-content;
    width: fit-content;
    position: relative;
    color: ${isLeveraged ? colors.black : colors.neonTurquoise};
    font-size: 1rem;
    ${theme.breakpoints.up(theme.breakpoints.values.sm)} {
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(to right, ${
        isLeveraged ? colors.black : colors.neonTurquoise
      }, ${isLeveraged ? colors.black : colors.neonTurquoise});
      transform: ${hovered ? 'scaleX(1)' : 'scaleX(0)'};
      transform-origin: left;
      transition: transform 0.3s ease;
      margin-bottom: -1px;
    }
  }`
);

const Pill = styled(SectionTitle)(
  `
    background: ${colors.aqua};
    border-radius: 20px;
    width: fit-content;
    padding: 6px 12px;
    color: ${colors.black};
    letter-spacing: 1px;
    `
);

export default ProductCards;
