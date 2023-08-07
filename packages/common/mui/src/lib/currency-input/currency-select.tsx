import { styled } from '@mui/material/styles';
import OptionUnstyled from '@mui/base/OptionUnstyled';
import { Box, Button } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { ReactNode, useState } from 'react';
import { SelectDropdown } from '../select-dropdown/select-dropdown';
import { H4 } from '../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';

export interface CurrencySelectProps {
  options: ReactNode[];
  ButtonComponent?: React.ElementType;
  defaultValue: string | null;
  onSelectChange?: (value: string | null) => void;
  popperRef?: React.ForwardedRef<unknown>;
}

/**
 * NOTE: odd behavior in SelectUnstyled requires that this be called
 * as a regular function, not a JSX component
 */
export const CurrencySelectOption = ({
  token,
  value,
  rightContent,
  theme,
}: {
  token: string;
  theme: NotionalTheme;
  value?: string;
  rightContent?: React.ReactNode;
}) => {
  return (
    <StyledItem value={value || token} key={token} theme={theme}>
      <TokenIcon symbol={token} size="medium" />
      <H4 marginLeft={theme.spacing(1)}>{token}</H4>
      {rightContent && <Box textAlign="right">{rightContent}</Box>}
    </StyledItem>
  );
};

const StyledItem = styled(OptionUnstyled)(
  ({ theme }) => `
  font-family: ${theme.typography.fontFamily};
  padding: ${theme.spacing(1, 2)};
  display: flex;
  line-height: 1.4;
  align-items: center;

  &:hover {
    background-color: ${theme.palette.background.default};
    cursor: pointer;
  }
  `
);

const StyledButton = styled(Button)(
  ({ theme }) => `
  min-width: ${theme.spacing(18)};
  margin-top: ${theme.spacing(-1)};
  margin-bottom: ${theme.spacing(-1)};
  flex-grow: 1;
  align-self: stretch;
  padding-right: ${theme.spacing(2)};
  padding-left: ${theme.spacing(2)};
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  .MuiButton-endIcon {
    margin-right: 0px;
    margin-left: auto;
  }
`
);

export function CurrencySelect({
  defaultValue,
  options,
  onSelectChange,
  popperRef,
  ButtonComponent,
}: CurrencySelectProps) {
  const [value, setValue] = useState<string | null>(defaultValue);

  const parentWidth =
    popperRef && popperRef['current']
      ? popperRef['current']['clientWidth']
      : undefined;

  return (
    <SelectDropdown
      value={value}
      buttonComponent={ButtonComponent || StyledButton}
      popperWidth={`${parentWidth}px`}
      onChange={(value: string | null) => {
        setValue(value);
        if (onSelectChange) onSelectChange(value);
      }}
    >
      {options}
    </SelectDropdown>
  );
}

export default CurrencySelect;
