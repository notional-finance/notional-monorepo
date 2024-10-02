import { useState } from 'react';
import { Input as MuiInput, InputProps as MuiInputProps, SxProps, useTheme } from '@mui/material';
import { InputLabel } from '../input-label/input-label';
import { styled } from '@mui/material/styles';
import { NotionalTheme } from '@notional-finance/styles';
import { MessageDescriptor } from 'react-intl';

 
export interface InputProps extends MuiInputProps {
  handleChange: React.ChangeEventHandler;
  inputValue: string | number;
  sx?: SxProps;
  placeholder?: string;
  inputLabel?: MessageDescriptor;
}

interface StyledInputProps {
  hasFocus: boolean;
  theme: NotionalTheme;
}

export function Input({
  handleChange,
  inputValue,
  sx,
  placeholder,
  inputLabel,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [hasFocus, setHasFocus] = useState(false);

  return (
    <>
      {inputLabel && <InputLabel inputLabel={inputLabel} />}
      <StyledInput
        sx={{ ...sx }}
        placeholder={placeholder}
        disableUnderline
        onChange={handleChange}
        value={inputValue}
        onFocus={() => {
          setHasFocus(true);
        }}
        onBlur={() => {
          setHasFocus(false);
        }}
        hasFocus={hasFocus}
        theme={theme}
        {...rest}
      />
    </>
  );
}

const StyledInput = styled(MuiInput, {
  shouldForwardProp: (prop: string) => prop !== 'hasFocus',
})(
  ({ theme, hasFocus }: StyledInputProps) => `
  font-size: 16px;
  padding: 16px 72px;
  padding-left: 16px;
  background-color: inherit;
  color: ${theme.palette.primary.dark};
  width: 100%;
  border: 1px solid ${hasFocus ? theme.palette.primary.main : theme.palette.borders.paper};
  border-radius: 4px;
  input {
    padding: 0px; 
  }
`
);

export default Input;
