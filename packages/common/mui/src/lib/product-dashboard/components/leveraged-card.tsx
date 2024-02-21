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
import { colors } from '@notional-finance/styles';

export const LeveragedCard = ({
  apy,
  title,
  symbol,
  subTitle,
  bottomValue,
  hasPosition,
  routeCallback,
  incentiveValue,
  incentiveSymbol,
}: DashboardDataProps) => {
  const theme = useTheme();

  return (
    <GridCard onClick={() => routeCallback()}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: theme.spacing(2),
        }}
      >
        <Box sx={{ display: 'flex' }}>
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
          sx={{ color: apy < 0 ? colors.red : theme.palette.typography.main }}
        >
          <SectionTitle>
            {hasPosition ? (
              <FormattedMessage defaultMessage={'Current APY'} />
            ) : (
              <FormattedMessage defaultMessage={'AS HIGH AS'} />
            )}
          </SectionTitle>
          {formatNumberAsPercent(apy)}
        </GridCardApy>
      </Box>
      <GridCardFooter id="incentive">
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
        {incentiveValue && incentiveSymbol && (
          <SectionTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <TokenIcon
              symbol={incentiveSymbol}
              size="small"
              style={{ marginRight: theme.spacing(1) }}
            />
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
      display: flex;
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

const GridCardApy = styled(CurrencyTitle)(
  ({ theme }) => `
      padding-left: ${theme.spacing(1)};
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
        ${theme.breakpoints.down('sm')} {
          width: ${theme.spacing(21)};
        }
        ${theme.breakpoints.down('xs')} {
          width: ${theme.spacing(18)};
        }
        `
);

export default LeveragedCard;
