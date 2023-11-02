import { AngledArrowIcon, CheckmarkIcon } from '@notional-finance/icons';
import { Box, useTheme } from '@mui/material';
import { SmallTableCell } from '../../typography/typography';
import { colors } from '@notional-finance/styles';

export interface ArrowIndicatorCellData {
  value: string;
  arrowUp: boolean | null;
  checkmark: boolean;
  greenOnArrowUp: boolean;
  greenOnCheckmark: boolean;
  isNegative?: boolean;
}

interface ArrowIndicatorCellProps {
  cell: {
    column: any;
    value: ArrowIndicatorCellData;
  };
}

export const ArrowIndicatorCell = ({
  cell,
}: ArrowIndicatorCellProps): JSX.Element => {
  const {
    column: { textAlign, tooRisky },
    value: {
      arrowUp,
      checkmark,
      greenOnArrowUp,
      greenOnCheckmark,
      value,
      isNegative,
    },
  } = cell;
  const { palette, shape, spacing } = useTheme();
  const arrowColor = tooRisky
    ? palette.error.main
    : greenOnArrowUp
    ? colors.orange
    : palette.primary.light;

  const valueTextColor = tooRisky
    ? palette.error.main
    : isNegative
    ? palette.error.main
    : palette.typography.main;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: textAlign,
      }}
    >
      <Box
        sx={{
          padding: spacing(0.25, 1),
          // Establish a minimum width for the box if it doesn't have a value
          minWidth: spacing(8),
          height: spacing(3),
          borderRadius: shape.borderRadiusLarge,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {arrowUp !== null ? (
          <>
            <SmallTableCell sx={{ color: valueTextColor }}>
              {value}
            </SmallTableCell>
            <AngledArrowIcon
              sx={{
                marginLeft: spacing(0.5),
                marginRight: spacing(-0.25),
                color: arrowColor,
                width: spacing(1.5),
                transform: arrowUp ? 'rotate(180deg)' : 'rotate(270deg)',
              }}
            />
          </>
        ) : (
          <>
            <SmallTableCell sx={{ color: valueTextColor }}>
              {value}
            </SmallTableCell>
            {checkmark && (
              <CheckmarkIcon
                sx={{
                  marginLeft: spacing(0.5),
                  marginRight: spacing(-0.5),
                  fill:
                    greenOnCheckmark === true
                      ? palette.primary.light
                      : palette.error.main,
                }}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ArrowIndicatorCell;
