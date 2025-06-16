import { SxProps } from '@mui/material';
import { MessageDescriptor } from 'react-intl';
import { H5 } from '../typography/typography';

interface InputLabelProps {
  inputLabel?: MessageDescriptor;
  sx?: SxProps;
}

export const InputLabel = ({ inputLabel, sx }: InputLabelProps) => {
  return inputLabel ? (
    <H5 gutter="default" msg={inputLabel} sx={{ ...sx }} />
  ) : null;
};
