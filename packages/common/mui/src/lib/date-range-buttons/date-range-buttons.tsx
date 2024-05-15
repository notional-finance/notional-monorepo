import { LabelValue } from '../typography/typography';
import { Box, styled, useTheme } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { SECONDS_IN_DAY } from '@notional-finance/util';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

interface DateRangeButtonsProps {
  setDateRange: Dispatch<SetStateAction<number>>;
  dateRange: number;
}
interface LabelButtonProps {
  active?: boolean;
  theme: NotionalTheme;
}

export const dateRangeData = [
  { displayValue: '30d', value: 2592000 },
  { displayValue: '90d', value: 7776000 },
  { displayValue: '1y', value: 31536000 },
  { displayValue: '2y', value: 63072000 },
];

export const DateRangeButtons = ({
  setDateRange,
  dateRange,
}: DateRangeButtonsProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        marginTop: theme.spacing(2),
        alignItems: 'center',
      }}
    >
      <LabelValue
        sx={{
          fontWeight: 600,
          fontSize: '16px',
          marginRight: theme.spacing(1),
          color: theme.palette.typography.light,
        }}
      >
        <FormattedMessage defaultMessage={'Time Frame: '} />
      </LabelValue>
      {dateRangeData.map((range, i) => (
        <LabelButton
          key={i}
          theme={theme}
          active={dateRange === range.value}
          onClick={() => setDateRange(range.value)}
        >
          {range.displayValue}
        </LabelButton>
      ))}
    </Box>
  );
};

const LabelButton = styled(LabelValue, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active, theme }: LabelButtonProps) => `
    cursor: pointer;
    background: ${active ? 'rgba(51, 248, 255, 0.15)' : 'transparent'};
    padding: ${theme.spacing(0.5, 1)};
    border-radius: ${theme.shape.borderRadius()};
    color: ${
      active ? theme.palette.typography.accent : theme.palette.typography.light
    };
    font-weight: ${active ? 600 : 400};
    margin-right: ${theme.spacing(1)};
    width: ${theme.spacing(5)};
    display: flex;
    align-items: center;
    justify-content: center;
        `
);

export default DateRangeButtons;
