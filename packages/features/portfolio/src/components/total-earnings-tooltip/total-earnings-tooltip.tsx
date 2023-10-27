// import { Box, useTheme, styled } from '@mui/material';
import {
  tooltipClasses,
  TooltipProps,
  Tooltip,
  Box,
  styled,
} from '@mui/material';

export const TotalEarningsTooltip = () => {
  const test = [1, 23, 43, 4, 46, 45];

  const NewComp = () => {
    return (
      <Box>
        {test.map((data) => (
          <Box sx={{ color: 'red' }}>{data}</Box>
        ))}
      </Box>
    );
  };

  return (
    <StyledToolTip title={<NewComp />}>
      <Box>TESTINGS</Box>
    </StyledToolTip>
  );
};

const StyledToolTip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: '8px 16px',
    backgroundColor: theme.palette.common.white,
    boxShadow: '-2px 0px 24px 0px #1429661A, 0px 3px 11px 0px #1D74771F',
    borderRadius: theme.shape.borderRadius(),
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white,
  },
}));

export default TotalEarningsTooltip;
