import { AngledArrowIcon, CheckmarkIcon } from '@notional-finance/icons';
import { Box, useTheme } from '@mui/material';

export interface ArrowIndicatorCellData {
  value: string;
  arrowUp: boolean | null;
  checkmark: boolean;
  greenOnArrowUp: boolean;
  greenOnCheckmark: boolean;
}

interface ArrowIndicatorCellProps {
  cell: {
    column: any;
    value: ArrowIndicatorCellData;
  };
}

export const ArrowIndicatorCell = ({ cell }: ArrowIndicatorCellProps): JSX.Element => {
  const {
    column: { textAlign },
    value: { arrowUp, checkmark, greenOnArrowUp, greenOnCheckmark, value },
  } = cell;
  const { palette, shape, spacing } = useTheme();
  const colorOnUp = greenOnArrowUp ? palette.primary.light : palette.error.main;
  const colorOnDown = greenOnArrowUp ? palette.error.main : palette.primary.light;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: textAlign,
      }}
    >
      <Box
        sx={{
          background: palette.info.light,
          padding: `2px ${spacing(1)}`,
          borderRadius: shape.borderRadiusLarge,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {checkmark && arrowUp === null && (
          <Box
            sx={{
              width: spacing(6),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ color: palette.common.black }}>-</Box>
            <CheckmarkIcon
              sx={{ fill: greenOnCheckmark ? palette.primary.light : palette.secondary.main }}
            />
          </Box>
        )}
        {!checkmark && arrowUp === null && (
          <Box
            sx={{
              width: spacing(6),
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box sx={{ color: palette.common.black, flex: 1, textAlign: 'center' }}>-</Box>
          </Box>
        )}
        {!checkmark && arrowUp !== null && (
          <>
            <Box sx={{ marginRight: '5px' }}>{value}</Box>
            <AngledArrowIcon
              sx={{
                color: arrowUp ? colorOnUp : colorOnDown,
                width: '12px',
                transform: arrowUp ? 'rotate(180deg)' : 'rotate(270deg)',
              }}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default ArrowIndicatorCell;
