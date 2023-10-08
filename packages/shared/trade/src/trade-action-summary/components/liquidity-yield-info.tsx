import { Box, useTheme } from '@mui/material';
import { YieldData } from '@notional-finance/core-entities';
import { H4, Subtitle, CountUp } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const LiquidityYieldInfo = ({
  liquidityYieldData,
}: {
  liquidityYieldData: YieldData;
}) => {
  const theme = useTheme();
  return (
    <Box display="inline-flex">
      <H4>
        <FormattedMessage defaultMessage={'Organic APY:'} />
        &nbsp;
      </H4>
      <Subtitle
        sx={{
          marginRight: theme.spacing(2),
          color:
            liquidityYieldData?.interestAPY !== undefined &&
            liquidityYieldData?.interestAPY < 0
              ? theme.palette.error.main
              : theme.palette.typography.light,
        }}
      >
        {liquidityYieldData?.interestAPY !== undefined ? (
          <CountUp
            value={liquidityYieldData.interestAPY}
            suffix="%"
            delay={0.3}
          />
        ) : (
          '-'
        )}
      </Subtitle>
      <H4>
        <FormattedMessage defaultMessage={'NOTE APY:'} />
        &nbsp;
      </H4>
      <Subtitle sx={{ color: theme.palette.typography.light }}>
        {liquidityYieldData?.incentives &&
        (liquidityYieldData?.incentives?.length || 0) > 0 ? (
          <CountUp
            value={liquidityYieldData?.incentives[0].incentiveAPY}
            suffix="%"
            delay={0.3}
          />
        ) : (
          '-'
        )}
      </Subtitle>
    </Box>
  );
};
