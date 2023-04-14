import { ReactNode } from 'react';
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
} from '@notional-finance/mui';

export interface PillProps {
  variableRate: boolean;
  theme: NotionalTheme;
}

// create interface for ProductCards props
export interface ProductCardsProps {
  title: ReactNode;
  link: string;
  text: ReactNode;
  apy: string;
  symbol: string;
  groupedSymbols: string;
  apyTitle: ReactNode;
  variableRate?: boolean;
  comingSoon?: boolean;
}

export interface PillProps {
  variableRate: boolean;
  theme: NotionalTheme;
}

export const ProductCards = ({
  title,
  link,
  text,
  apy,
  symbol,
  groupedSymbols,
  apyTitle,
  variableRate = false,
  comingSoon,
}: ProductCardsProps) => {
  const theme = useTheme();
  return (
    <CardContainer to={link}>
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
                useAltImg
                style={{ marginRight: theme.spacing(1.5) }}
              />
              {apy}
            </H4>
          </>
        )}
      </CardContent>
      <CardFooter>
        <CardInput
          sx={{
            color: comingSoon ? colors.white : colors.neonTurquoise,
          }}
        >
          {comingSoon ? (
            <FormattedMessage defaultMessage={'Coming Soon'} />
          ) : (
            <>
              <FormattedMessage defaultMessage={'View All Currencies'} />
              <ArrowRightIcon
                sx={{
                  height: theme.spacing(1.75),
                  width: theme.spacing(1.75),
                  marginLeft: theme.spacing(2),
                  marginBottom: '-2px',
                }}
              />
            </>
          )}
        </CardInput>
        <TokenIcon
          symbol={groupedSymbols}
          size="medium"
          style={{ width: 'fit-content' }}
        />
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

export default ProductCards;
