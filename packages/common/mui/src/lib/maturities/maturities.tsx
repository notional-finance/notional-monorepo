import { MaturityCard } from '../maturity-card/maturity-card';
import { Box, useTheme } from '@mui/material';
import { MaturityData } from '@notional-finance/notionable';
import { InputLabel } from '../input-label/input-label';
import { MessageDescriptor } from 'react-intl';

export interface MaturitiesProps {
  maturityData: MaturityData[];
  currentMarketKey: string | null;
  onSelect: (marketKey: string | null) => void;
  inputLabel?: MessageDescriptor;
}

export function Maturities({
  maturityData,
  onSelect,
  currentMarketKey,
  inputLabel,
}: MaturitiesProps) {
  const theme = useTheme();
  return (
    <Box>
      <InputLabel inputLabel={inputLabel} />
      <Box sx={{ display: 'flex' }}>
        <Box style={{ boxShadow: theme.shape.shadowStandard, display: 'flex' }}>
          {maturityData.map((data, index) => (
            <MaturityCard
              key={`maturity-${index}`}
              maturityData={data}
              selected={currentMarketKey && currentMarketKey === data.marketKey ? true : false}
              onSelect={(key) => {
                const selectedMarketKey = key && key !== currentMarketKey ? key : null;
                onSelect(selectedMarketKey);
              }}
              isFirstChild={index === 0}
              isLastChild={index === maturityData.length - 1}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
