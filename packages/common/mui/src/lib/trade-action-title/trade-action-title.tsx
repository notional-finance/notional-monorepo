import { Box, useTheme } from '@mui/material';
import CountUp from '../count-up/count-up';
import { H1 } from '../typography/typography';
import { PointsIcon } from '@notional-finance/icons';

export interface TradeActionTitleProps {
  title: React.ReactNode;
  value?: number;
  valueSuffix?: string;
  hasPoints?: boolean;
  InfoComp?: React.ReactNode;
}

export function TradeActionTitle({
  title,
  value,
  valueSuffix = '',
  hasPoints,
  InfoComp,
}: TradeActionTitleProps) {
  const theme = useTheme();
  return (
    <Box>
      <H1
        sx={{
          display: 'flex',
          alignItems: 'center',
          color:
            value && value < 0
              ? theme.palette.error.main
              : theme.palette.typography.main,
        }}
      >
        {value !== undefined ? (
          <CountUp
            value={value}
            suffix={valueSuffix}
            decimals={2}
            delay={0.3}
          />
        ) : (
          '-'
        )}
        &nbsp;
        {title}
        {hasPoints && (
          <PointsIcon
            sx={{ fontSize: 'inherit', marginLeft: theme.spacing(2) }}
          />
        )}
      </H1>
      {InfoComp && InfoComp}
    </Box>
  );
}

export default TradeActionTitle;
