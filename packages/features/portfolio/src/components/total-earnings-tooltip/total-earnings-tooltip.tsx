import { H5, InfoTooltip } from '@notional-finance/mui';
import { NotionalTheme } from '@notional-finance/styles';
import { Box, styled, useTheme } from '@mui/material';

interface TotalEarningsTooltipProps {
  toolTipData: {
    underlyingBaseCurrency: string;
    underlying: string;
    noteBaseCurrency: string;
    note: string;
  };
}

interface FirstValueProps {
  theme: NotionalTheme;
  isNegative?: boolean;
}

export const TotalEarningsTooltip = ({
  toolTipData: { underlyingBaseCurrency, underlying, noteBaseCurrency, note },
}: TotalEarningsTooltipProps) => {
  const theme = useTheme();

  const HoverComponent = () => {
    return (
      <Box>
        <ValueContainer sx={{ marginBottom: theme.spacing(1) }}>
          <FirstValue theme={theme} isNegative={underlying.includes('-')}>
            {underlying}
          </FirstValue>
          <H5>({underlyingBaseCurrency})</H5>
        </ValueContainer>
        <ValueContainer>
          <FirstValue theme={theme} isNegative={note.includes('-')}>
            {note}
          </FirstValue>
          <H5>({noteBaseCurrency})</H5>
        </ValueContainer>
      </Box>
    );
  };

  return (
    <InfoTooltip
      sx={{ marginLeft: theme.spacing(1) }}
      iconColor={theme.palette.typography.accent}
      ToolTipComp={HoverComponent}
      iconSize={theme.spacing(2)}
    ></InfoTooltip>
  );
};

const ValueContainer = styled(Box)(`
  display: flex;
  flex-direction: row;
  justify-content: end;
`);

const FirstValue = styled(H5, {
  shouldForwardProp: (prop: string) => prop !== 'isNegative',
})(
  ({ theme, isNegative }: FirstValueProps) => `
  margin-right: ${theme.spacing(1)};
  color: ${
    isNegative ? theme.palette.error.main : theme.palette.typography.main
  };
`
);

export default TotalEarningsTooltip;
