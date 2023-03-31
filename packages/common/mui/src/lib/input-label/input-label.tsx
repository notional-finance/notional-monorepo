import { SxProps } from '@mui/material';
import { MessageDescriptor } from 'react-intl';
import { HeadingSubtitle } from '../typography/typography';

interface InputLabelProps {
  inputLabel?: MessageDescriptor;
  sx?: SxProps;
}

export const InputLabel = ({ inputLabel, sx }: InputLabelProps) => {
  return inputLabel ? (
    <HeadingSubtitle gutter="default" msg={inputLabel} sx={{ ...sx }} />
  ) : null;
};
