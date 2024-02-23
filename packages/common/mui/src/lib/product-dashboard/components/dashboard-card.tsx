import { Box, useTheme, styled } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { DashboardDataProps } from '../product-dashboard';
import {
  SmallInput,
  CurrencyTitle,
  SectionTitle,
} from '../../typography/typography';
import { FormattedMessage } from 'react-intl';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { NotionalTheme, colors } from '@notional-finance/styles';

interface GridCardApyProps {
  hideApySubTitle: boolean;
  theme: NotionalTheme;
}

export const DashboardCard = ({
  apy,
  title,
  symbol,
  subTitle,
  bottomValue,
  apySubTitle,
  routeCallback,
  incentiveValue,
  incentiveSymbols,
}: DashboardDataProps) => {
  const theme = useTheme();

  const hideFooter = !bottomValue && !incentiveSymbols;

  return (
    <GridCard onClick={() => routeCallback()}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: theme.spacing(2),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TokenIcon
            symbol={symbol}
            size="xl"
            style={{ marginRight: theme.spacing(2) }}
          />
          <Box component="div" sx={{ textAlign: 'left', margin: 'auto' }}>
            <GridCardTitle>{title}</GridCardTitle>
            <GridCardSubTitle id="grid-card-sub-title">
              {subTitle}
            </GridCardSubTitle>
          </Box>
        </Box>

        <GridCardApy
          hideApySubTitle={!apySubTitle ? true : false}
          theme={theme}
          sx={{ color: apy < 0 ? colors.red : theme.palette.typography.main }}
        >
          <SectionTitle
            sx={{
              display: 'flex',
              justifyContent: 'end',
            }}
          >
            {apySubTitle && <FormattedMessage {...apySubTitle} />}
          </SectionTitle>
          {formatNumberAsPercent(apy) + ' APY'}
        </GridCardApy>
      </Box>
      <GridCardFooter
        id="incentive"
        sx={{ display: hideFooter ? 'none' : 'flex' }}
      >
        {bottomValue && (
          <SectionTitle
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {bottomValue}
          </SectionTitle>
        )}
        {incentiveSymbols && incentiveSymbols.length > 0 && (
          <SectionTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingLeft:
                incentiveSymbols.length > 1 ? theme.spacing(1) : '0px',
            }}
          >
            {incentiveSymbols.map((incentiveSymbol, index) => (
              <TokenIcon
                key={index}
                symbol={incentiveSymbol}
                size="small"
                style={{
                  marginRight: theme.spacing(1),
                  position:
                    index === 1 && incentiveSymbols.length > 1
                      ? 'absolute'
                      : 'relative',
                  marginLeft:
                    index === 1 && incentiveSymbols.length > 1 ? '-8px' : '0px',
                }}
              />
            ))}
            <Box
              sx={{
                color: theme.palette.typography.main,
                marginRight: theme.spacing(0.5),
              }}
            >
              {incentiveValue}
            </Box>
            <FormattedMessage defaultMessage={'Incentive APY'} />
          </SectionTitle>
        )}
      </GridCardFooter>
    </GridCard>
  );
};

const GridCardFooter = styled(Box)(
  ({ theme }) => `
      width: 100%;
      background: ${theme.palette.background.default};
      border-radius: 0px 0px ${theme.shape.borderRadius()} ${theme.shape.borderRadius()};
      padding: ${theme.spacing(1, 2)};
      display: flex;
      justify-content: space-between;
        `
);

const GridCard = styled(Box)(
  ({ theme }) => `
      border-radius: ${theme.shape.borderRadius()};
      border: ${theme.shape.borderStandard};
      display: flex;
      flex-direction: column;
      box-shadow: ${theme.shape.shadowStandard};
      ${theme.gradient.hoverTransition(
        theme.palette.background.paper,
        theme.palette.info.light
      )};
      &:hover {
        cursor: pointer;
        border: 1px solid ${theme.palette.primary.light};
        transition: 0.3s ease;
        transform: scale(1.02);
        #incentive {
            background: rgba(19, 187, 194, 0.10);
        }
      }
        `
);

const GridCardTitle = styled(SmallInput)(
  `
    display: block;
    text-align: left;
      `
);

const GridCardApy = styled(CurrencyTitle, {
  shouldForwardProp: (prop: string) => prop !== 'hideApySubTitle',
})(
  ({ hideApySubTitle, theme }: GridCardApyProps) => `
      display: ${hideApySubTitle ? 'flex' : 'block'};
      align-items: ${hideApySubTitle ? 'center' : ''};
      padding-left: ${theme.spacing(1)};
      white-space: nowrap;
        `
);

const GridCardSubTitle = styled('span')(
  ({ theme }) => `
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      color: ${theme.palette.typography.light};
      display: block;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
        `
);

export default DashboardCard;
