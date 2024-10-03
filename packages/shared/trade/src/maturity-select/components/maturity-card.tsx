import { FormattedMessage } from 'react-intl';
import { Box, useTheme } from '@mui/material';
import { LabelValue, BodySecondary, CountUp } from '@notional-finance/mui';
import { formatMaturity } from '@notional-finance/util';
import { MaturityData } from '@notional-finance/notionable-hooks';

 
export interface MaturityCardProps {
  maturityData: MaturityData;
  onSelect: (marketKey?: string) => void;
  selected: boolean;
  isFirstChild: boolean;
  isLastChild: boolean;
  isVariable?: boolean;
}

export function MaturityCard({
  selected,
  maturityData,
  isFirstChild,
  isLastChild,
  onSelect,
  isVariable,
}: MaturityCardProps) {
  const theme = useTheme();
  const { tradeRate, maturity, tokenId } = maturityData;
  const disabled = tradeRate === undefined;

  const handleSelect = () => {
    if (!disabled) onSelect(tokenId);
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
        transition: 'background 0.3s ease',
        ':hover': {
          background: `${theme.palette.primary.light}15`,
        },
        boxShadow: isVariable ? theme.shape.shadowStandard : 'unset',
      }}
    >
      <BodySecondary accent={selected} gutter="tight">
        {isVariable ? (
          <FormattedMessage defaultMessage={'Current Rate'} />
        ) : (
          formatMaturity(maturity)
        )}
      </BodySecondary>
      <LabelValue fontWeight="regular">
        {tradeRate === undefined && '--'}
        {tradeRate !== undefined && (
          <CountUp value={tradeRate} suffix="%" duration={1} />
        )}
      </LabelValue>
    </Box>
  );
}

export default MaturityCard;
