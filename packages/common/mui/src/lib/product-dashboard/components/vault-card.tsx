import { Box, useTheme, styled } from '@mui/material';
import { TokenIcon, LeafIcon } from '@notional-finance/icons';
import { DashboardDataProps } from '../product-dashboard';
import {
  SmallInput,
  CurrencyTitle,
  SectionTitle,
} from '../../typography/typography';
import ProgressIndicator from '../../progress-indicator/progress-indicator';
import { FormattedMessage } from 'react-intl';

export const VaultCard = ({
  title,
  apy,
  tvl,
  symbol,
  hasPosition,
  incentiveValue,
  incentiveSymbol,
  organicApyOnly,
}: DashboardDataProps) => {
  const theme = useTheme();
  return (
    <GridCard>
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
            <GridCardTVL>{tvl}</GridCardTVL>
          </Box>
        </Box>

        <GridCardApy>
          <SectionTitle>
            {hasPosition ? (
              <FormattedMessage defaultMessage={'Current APY'} />
            ) : (
              <FormattedMessage defaultMessage={'AS HIGH AS'} />
            )}
          </SectionTitle>
          {apy ? apy : <ProgressIndicator type="circular" circleSize={18} />}
        </GridCardApy>
      </Box>
      <IncentiveContainer id="incentive">
        {incentiveValue && incentiveSymbol && !organicApyOnly && (
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
        {organicApyOnly && (
          <SectionTitle
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <LeafIcon
              style={{
                height: theme.spacing(2),
                marginRight: theme.spacing(0.5),
              }}
              fill={theme.palette.common.black}
            />
            <FormattedMessage defaultMessage={'Organic APY'} />
          </SectionTitle>
        )}
      </IncentiveContainer>
    </GridCard>
  );
};

const IncentiveContainer = styled(Box)(
  ({ theme }) => `
      display: flex;
      width: 100%;
      background: ${theme.palette.background.default};
      border-radius: 0px 0px ${theme.shape.borderRadius()} ${theme.shape.borderRadius()};
      padding: ${theme.spacing(1, 2)};
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
  ({ theme }) => `
    display: block;
    text-align: left;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: ${theme.spacing(30.5)};    
      ${theme.breakpoints.down('xs')} {
        width: ${theme.spacing(21)};
    }
      `
);

const GridCardApy = styled(CurrencyTitle)(
  ({ theme }) => `
      color: ${theme.palette.typography.main};
      padding-left: ${theme.spacing(1)};
        `
);

const GridCardTVL = styled('span')(
  ({ theme }) => `
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      color: ${theme.palette.typography.light};
        `
);
