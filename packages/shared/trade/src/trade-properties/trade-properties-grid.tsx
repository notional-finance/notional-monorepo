import { Grid, styled, useTheme } from '@mui/material';
import { TradeProperties, TradePropertyKeys } from '.';
import { TradeProperty } from './trade-property';

interface TradePropertiesGridProps {
  labelsAbove?: boolean;
  data: TradeProperties;
  showBackground?: boolean;
}

const StyledGridItem = styled(Grid)``;

export function TradePropertiesGrid({
  labelsAbove = false,
  data,
  showBackground = false,
}: TradePropertiesGridProps) {
  const theme = useTheme();
  const keys = Object.keys(data) as TradePropertyKeys[];
  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      sx={{
        marginLeft: '0px',
        width: '100%',
        paddingBottom: '16px',
        paddingRight: '16px',
        color: theme.palette.common.black,
        border: showBackground ? theme.shape.borderStandard : 'unset',
        borderRadius: showBackground ? theme.shape.borderRadiusLarge : 'unset',
        backgroundColor: showBackground ? theme.palette.background.default : 'unset',
      }}
    >
      {keys.map((k) => {
        const value = data[k];
        return value !== undefined ? (
          <StyledGridItem item xs={4} key={k as string}>
            <TradeProperty propertyKey={k} value={value} labelAbove={labelsAbove} />
          </StyledGridItem>
        ) : null;
      })}
    </Grid>
  );
}
