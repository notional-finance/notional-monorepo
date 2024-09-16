import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { colors } from '@notional-finance/styles';
import { useTheme, Box, styled, alpha } from '@mui/material';
import { TokenIcon, ArrowRightIcon } from '@notional-finance/icons';
import { H4, LinkText, LargeInputTextEmphasized } from '@notional-finance/mui';

interface ProductRateCardsProps {
  title: ReactNode;
  productRateData: {
    title: ReactNode;
    link: string;
    apy: string;
    symbol: string | undefined;
    icon: ReactNode;
  }[];
}

export const ProductRateCards = ({
  productRateData,
  title,
}: ProductRateCardsProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <H4>{title}</H4>
        <LinkText
          sx={{
            marginTop: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
          }}
          to={'/markets'}
        >
          <FormattedMessage defaultMessage={'Compare All Rates'} />
        </LinkText>
      </Box>
      {productRateData.map(({ title, apy, symbol, link, icon }, index) => (
        <ProductCard onClick={() => navigate(link)} key={index}>
          <Box id="text-content" sx={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <H4 sx={{ textWrap: 'nowrap', marginLeft: theme.spacing(2) }}>
              {title}
              <LinkText
                sx={{
                  marginTop: theme.spacing(1),
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FormattedMessage defaultMessage={'See all currencies'} />
                <ArrowRightIcon
                  sx={{
                    height: theme.spacing(1.5),
                    width: theme.spacing(1.5),
                    marginLeft: theme.spacing(1),
                    marginBottom: '-2px',
                  }}
                  fill={theme.palette.typography.accent}
                />
              </LinkText>
            </H4>
          </Box>
          <ApyContainer id="apy-content">
            {symbol && <TokenIcon symbol={symbol} size="medium" />}
            <LargeInputTextEmphasized sx={{ marginLeft: theme.spacing(1) }}>
              {apy}
            </LargeInputTextEmphasized>
          </ApyContainer>
        </ProductCard>
      ))}
    </>
  );
};

const ProductCard = styled(Box)(
  ({ theme }) => `
    background: ${theme.palette.background.default};
    border-radius: ${theme.shape.borderRadius()};
    border: ${theme.shape.borderStandard};
    padding: ${theme.spacing(2)};
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 45%;
    cursor: pointer;
    transition: background 0.3s ease;
    &:hover {
      background: ${alpha(colors.aqua, 0.2)};
    }
    ${theme.breakpoints.down('md')} {
      min-width: 100%;
      flex-direction: column;
      gap: ${theme.spacing(3)};
      #text-content {
        width: 100%;
      }
      #apy-content {
        width: 100%;
      }
    }
  `
);

const ApyContainer = styled(Box)(
  ({ theme }) => `
    background: ${theme.palette.info.light};
    border-radius: ${theme.shape.borderRadius()};
    display: flex;
    padding: ${theme.spacing(1)};
    align-items: center;
  `
);
export default ProductRateCards;
