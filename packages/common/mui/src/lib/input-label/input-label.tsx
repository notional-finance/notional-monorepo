import { MessageDescriptor } from 'react-intl';
import { HeadingSubtitle } from '../typography/typography';

interface InputLabelProps {
  inputLabel?: MessageDescriptor;
}

export const InputLabel = ({ inputLabel }: InputLabelProps) => {
  return inputLabel ? <HeadingSubtitle gutter="default" msg={inputLabel} /> : null;
};
