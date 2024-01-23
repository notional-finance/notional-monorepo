import { AngledArrowIcon, CheckmarkIcon } from '@notional-finance/icons';
import { Box, useTheme } from '@mui/material';
import { SmallTableCell } from '../../typography/typography';
import { colors } from '@notional-finance/styles';

export const ArrowIndicatorCell = ({ cell }): JSX.Element => {
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
  const colorOnUp = greenOnArrowUp ? palette.primary.light : colors.orange;
  const colorOnDown = greenOnArrowUp ? colors.orange : palette.primary.light;

  const valueTextColor =
    tooRisky || isNegative ? palette.error.main : palette.typography.main;

  const valueArrowColor = tooRisky
    ? palette.error.main
    : arrowUp
    ? colorOnUp
    : colorOnDown;

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
            <SmallTableCell
              sx={{
                color: cell?.row?.original?.textColor || valueTextColor,
              }}
            >
              {value}
            </SmallTableCell>
            {!cell.row.original.hideArrow && (
              <AngledArrowIcon
                sx={{
                  marginLeft: spacing(0.5),
                  marginRight: spacing(-0.25),
                  color: valueArrowColor,
                  width: spacing(1.5),
                  transform: arrowUp ? 'rotate(180deg)' : 'rotate(270deg)',
                }}
              />
            )}
          </>
        ) : (
          <>
            <SmallTableCell
              sx={{
                color: cell?.row?.original?.textColor || valueTextColor,
              }}
            >
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
