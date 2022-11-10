import { FormattedMessage } from 'react-intl';
import { Box, useTheme } from '@mui/material';
import { MaturityData } from '@notional-finance/notionable';
import CountUp from '../count-up/count-up';
import { LabelValue, BodySecondary } from '../typography/typography';
import { formatMaturity } from '@notional-finance/utils';

/* eslint-disable-next-line */
export interface MaturityCardProps {
  maturityData: MaturityData;
  onSelect: (marketKey?: string) => void;
  selected: boolean;
  isFirstChild: boolean;
  isLastChild: boolean;
}

export function MaturityCard({
  selected,
  maturityData,
  isFirstChild,
  isLastChild,
  onSelect,
}: MaturityCardProps) {
  const theme = useTheme();
  const { tradeRate, hasLiquidity, maturity, marketKey } = maturityData;
  const disabled = tradeRate === undefined || !hasLiquidity;

  const handleSelect = () => {
    if (!disabled) onSelect(marketKey);
  };

  const getBackgroundColor = () => {
    if (disabled) {
      return theme.palette.background.default;
    } else if (selected) {
      return theme.palette.info.light;
    } else {
      return theme.palette.common.white;
    }
  };

  const getBorderColor = () => {
    if (selected) {
      return theme.palette.primary.light;
    } else {
      return theme.palette.borders.paper;
    }
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyPress={handleSelect}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        border: `1px solid ${getBorderColor()}`,
        borderTopLeftRadius: isFirstChild ? theme.shape.borderRadius() : 0,
        borderBottomLeftRadius: isFirstChild ? theme.shape.borderRadius() : 0,
        borderTopRightRadius: isLastChild ? theme.shape.borderRadius() : 0,
        borderBottomRightRadius: isLastChild ? theme.shape.borderRadius() : 0,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        width: theme.spacing(14),
        background: getBackgroundColor(),
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <BodySecondary accent={selected} gutter="tight">
        {formatMaturity(maturity)}
      </BodySecondary>
      <LabelValue fontWeight="regular">
        {!hasLiquidity && <FormattedMessage defaultMessage="Not Initialized" />}
        {tradeRate === undefined && '--'}
        {hasLiquidity && tradeRate !== undefined && (
          <CountUp value={tradeRate} suffix="%" duration={1} />
        )}
      </LabelValue>
    </Box>
  );
}

export default MaturityCard;
