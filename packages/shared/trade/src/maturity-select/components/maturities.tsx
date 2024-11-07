import { Box, useTheme } from '@mui/material';
import { MessageDescriptor } from 'react-intl';
import { InputLabel } from '@notional-finance/mui';
import MaturityCard from './maturity-card';
import { TokenOption } from '@notional-finance/notionable';

export interface MaturitiesProps {
  maturityData: TokenOption[];
  defaultfCashId: string;
  selectedfCashId: string | undefined;
  onSelect: (selectedId: string | undefined) => void;
  inputLabel?: MessageDescriptor;
}

export function Maturities({
  maturityData,
  onSelect,
  selectedfCashId,
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
              selected={
                selectedfCashId && selectedfCashId === data?.token.id
                  ? true
                  : false
              }
              onSelect={(key) => {
                if (key !== selectedfCashId) {
                  onSelect(key);
                }
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
