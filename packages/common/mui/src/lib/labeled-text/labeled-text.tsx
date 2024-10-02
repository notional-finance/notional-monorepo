import { styled, SxProps, Box } from '@mui/material';
import { Label, LabelValue } from '../typography/typography';

 
export interface LabeledTextProps {
  label: string | React.ReactNode;
  value: string | React.ReactNode;
  labelClass?: string;
  valueClass?: string;
  wrapperClass?: string;
  labelAbove?: boolean;
  sx?: SxProps;
}

const StyledLabel = styled(Label)`
  display: block;
  text-align: left;
`;
const StyledValue = styled(LabelValue)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
`;

export function LabeledText({
  label,
  value,
  labelClass,
  valueClass,
  wrapperClass,
  labelAbove,
  sx,
}: LabeledTextProps) {
  if (labelAbove) {
    return (
      <Box className={`${wrapperClass || ''}`} sx={sx}>
        <StyledLabel fontWeight="medium" className={`${labelClass || ''}`}>
          {label}
        </StyledLabel>
        <StyledValue sx={{ marginTop: '4px' }} className={`${valueClass || ''}`}>
          {value}
        </StyledValue>
      </Box>
    );
  } else {
    return (
      <Box className={`${wrapperClass || ''}`} sx={sx}>
        <StyledValue fontWeight="medium" className={`${valueClass || ''}`}>
          {value}
        </StyledValue>
        <StyledLabel sx={{ marginTop: '4px' }} className={`${labelClass || ''}`}>
          {label}
        </StyledLabel>
      </Box>
    );
  }
}

export default LabeledText;
