import { AngledArrowIcon, CheckmarkIcon } from '@notional-finance/icons';
import { Box, useTheme } from '@mui/material';
import { SmallTableCell } from '../../typography/typography';

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

export const ArrowIndicatorCell = ({
  cell,
}: ArrowIndicatorCellProps): JSX.Element => {
  const {
    column: { textAlign },
    value: { arrowUp, checkmark, greenOnArrowUp, greenOnCheckmark, value },
  } = cell;
  const { palette, shape, spacing } = useTheme();
  const colorOnUp = greenOnArrowUp ? palette.primary.light : palette.error.main;
  const colorOnDown = greenOnArrowUp
    ? palette.error.main
    : palette.primary.light;
  let backgroundColor = palette.info.light;
  if (arrowUp === true && greenOnArrowUp === false)
    backgroundColor = palette.error.light;
  if (arrowUp === false && greenOnArrowUp === true)
    backgroundColor = palette.error.light;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: textAlign,
      }}
    >
      <Box
        sx={{
          background: backgroundColor,
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
            <SmallTableCell sx={{ color: palette.typography.main }}>
              {value}
            </SmallTableCell>
            <AngledArrowIcon
              sx={{
                marginLeft: spacing(0.5),
                marginRight: spacing(-0.25),
                color: arrowUp ? colorOnUp : colorOnDown,
                width: spacing(1.5),
                transform: arrowUp ? 'rotate(180deg)' : 'rotate(270deg)',
              }}
            />
          </>
        ) : (
          <>
            <SmallTableCell sx={{ color: palette.typography.main }}>
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
