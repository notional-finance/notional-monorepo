import { useState, ReactNode } from 'react';
import { TokenIcon, ArrowRightIcon } from '@notional-finance/icons';
import { Box, styled, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { colors, NotionalTheme } from '@notional-finance/styles';
import { Link } from 'react-router-dom';
import {
  H4,
  H3,
  BodySecondary,
  SectionTitle,
  CardInput,
  ProgressIndicator,
} from '@notional-finance/mui';

export interface PillProps {
  variableRate: boolean;
  theme: NotionalTheme;
}
export interface ProductCardsProps {
  title: ReactNode;
  link: string;
  text: ReactNode;
  apy: string;
  symbol: string;
  groupedSymbols: string;
  apyTitle: ReactNode;
  href?: string;
  variableRate?: boolean;
  comingSoon?: boolean;
  loading?: boolean;
}

export interface PillProps {
  variableRate: boolean;
  theme: NotionalTheme;
}
export interface CardFooterTextProps {
  hovered: boolean;
  comingSoon: boolean;
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
  variableRate = false,
  comingSoon,
  loading,
}: ProductCardsProps) => {
  const [hovered, setHovered] = useState(false);
  const theme = useTheme();

  return (
    <CardContainer
      to={href ? { pathname: href || '' } : link}
      target={href ? '_blank' : ''}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardContent>
        <H3 sx={{ color: colors.white }}>{title}</H3>
        <Pill variableRate={variableRate} theme={theme}>
          {variableRate ? (
            <FormattedMessage defaultMessage={'variable rate'} />
          ) : (
            <FormattedMessage defaultMessage={'fixed rate'} />
          )}
        </Pill>
        <BodySecondary
          sx={{
            color: colors.white,
            marginBottom: theme.spacing(6),
          }}
        >
          {text}
        </BodySecondary>
        {!comingSoon && (
          <>
            <SectionTitle
              sx={{
                letterSpacing: '1px',
                color: colors.greenGrey,
                marginBottom: theme.spacing(1.5),
              }}
            >
              {apyTitle}
            </SectionTitle>
            {!loading ? (
              <H4
                sx={{
                  color: colors.white,
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
              </H4>
            ) : (
              <Box sx={{ width: theme.spacing(6) }}>
                <ProgressIndicator />
              </Box>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <CardInput>
          {comingSoon ? (
            <FormattedMessage defaultMessage={'Coming Soon'} />
          ) : (
            <Box>
              <CardFooterText
                comingSoon={comingSoon || false}
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
                />
              </CardFooterText>
            </Box>
          )}
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

const CardContainer = styled(Link)(
  ({ theme }) => `
      cursor: pointer;
      margin-top: ${theme.spacing(8)};
      height: ${theme.spacing(53)};
      width: ${theme.spacing(53)};
      border: 1px solid ${colors.blueGreen};
      border-radius: ${theme.shape.borderRadius()};
      box-shadow: 0px 34px 50px -15px rgba(51, 248, 255, 0.3);
      transition: all 0.3s ease;
      z-index: 1;
  
      ${theme.gradient.hoverTransition(
        colors.darkGreen,
        theme.palette.info.light
      )}

      &:hover {
        cursor: pointer;
        box-shadow: ${theme.shape.shadowLarge(colors.purpleGrey)};
        transition: all 0.3s ease;
        transform: scale(1.1);
      }

      ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
        height: 100%;
        width: 100%;
        background: ${colors.white};
        border: 1px solid ${colors.purpleGrey};
        h3 {
          font-size: 1.375rem;
          color: ${colors.black};
        }
        h4 {
          color: ${colors.black};
          font-size: 1.5rem;
        }
        p {
          color: ${colors.darkGrey};
          margin-bottom: ${theme.spacing(3)};
          font-size: 1rem;
        }
        box-shadow: 0px 34px 50px -15px rgba(20, 42, 74, 0.3);
        &:hover {
          cursor: pointer;
          box-shadow: 0px 34px 50px -15px rgba(20, 42, 74, 0.3);
          transition: none;
          transform: none;
        }
        ${theme.gradient.hoverTransition(colors.white, colors.white)}
      }
    `
);

const CardContent = styled(Box)(
  ({ theme }) => `
      height: 80%;
      padding: ${theme.spacing(4)};
      position: relative;
      z-index: 2;
      ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
        padding: ${theme.spacing(3)};
      }
    `
);

const CardFooter = styled(Box)(
  ({ theme }) => `
    background: ${colors.black};
    width: 100%;
    height: 20%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing(0, 4)};
    border-radius: 0px 0px 6px 6px;
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

const Pill = styled(SectionTitle, {
  shouldForwardProp: (prop: string) => prop !== 'variableRate',
})(
  ({ variableRate, theme }: PillProps) => `
    margin: ${theme.spacing(2, 0)};
    background: ${
      variableRate
        ? 'linear-gradient(89.71deg, #56F9FF 0.22%, #4AAAD3 97.77%)'
        : colors.aqua
    };
    border-radius: 20px;
    width: fit-content;
    padding: ${theme.spacing(1, 1.5)};
    color: ${colors.black};
    letter-spacing: 1px;
    `
);

const CardFooterText = styled(Box, {
  shouldForwardProp: (prop: string) =>
    prop !== 'comingSoon' && prop !== 'hovered',
})(
  ({ comingSoon, hovered, theme }: CardFooterTextProps) => `
    height: fit-content;
    width: fit-content;
    position: relative;
    color: ${comingSoon ? colors.white : colors.neonTurquoise};
    ${theme.breakpoints.up(theme.breakpoints.values.sm)} {
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(to right, ${colors.neonTurquoise}, ${
    colors.neonTurquoise
  });
      transform: ${hovered ? 'scaleX(1)' : 'scaleX(0)'};
      transform-origin: left;
      transition: transform 0.3s ease;
      margin-bottom: -1px;
    }
  }
    `
);

export default ProductCards;
