import { Box, useTheme, styled } from '@mui/material';
import { TokenIcon, LeafIcon } from '@notional-finance/icons';
import {
  SmallInput,
  CurrencyTitle,
  SectionTitle,
} from '../../typography/typography';
import ProgressIndicator from '../../progress-indicator/progress-indicator';

export const VaultCard = ({
  title,
  apy,
  tvl,
  symbol,
  incentiveValue,
  incentiveSymbol,
  organicApyOnly,
}) => {
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
          <SectionTitle>AS HIGH AS</SectionTitle>
          {apy ? apy : <ProgressIndicator type="circular" circleSize={18} />}
        </GridCardApy>
      </Box>
      <IncentiveContainer id="incentive">
        {incentiveValue && incentiveSymbol && !organicApyOnly && (
          <SectionTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
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
            Incentive APY
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
            <LeafIcon style={{ height: theme.spacing(2) }} />
            Organic Value
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
      box-shadow: 0px 4px 10px 0px rgba(20, 42, 74, 0.07);

      ${theme.gradient.hoverTransition(
        theme.palette.background.paper,
        theme.palette.info.light
      )}
  
      &:hover {
        cursor: pointer;
        border: 1px solid ${theme.palette.secondary.accent};
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
