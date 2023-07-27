import { styled } from '@mui/material/styles';
import OptionUnstyled from '@mui/base/OptionUnstyled';
import { NotionalTheme } from '@notional-finance/styles';
import { Button, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { ReactNode, useEffect, useState } from 'react';
import { SelectDropdown } from '../select-dropdown/select-dropdown';
import { H4 } from '../typography/typography';

export interface CurrencySelectProps {
  currencies: string[];
  landingPage?: boolean;
  defaultValue?: string;
  onSelectChange?: (value: string | null) => void;
  children?: ReactNode;
  popperRef?: React.ForwardedRef<unknown>;
}

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

export function CurrencySelect(props: CurrencySelectProps) {
  const {
    defaultValue,
    currencies,
    onSelectChange,
    landingPage = false,
    popperRef,
  } = props;
  const theme = useTheme() as NotionalTheme;
  const [value, setValue] = useState<string | null>(
    defaultValue || currencies[0]
  );

  const parentWidth =
    popperRef && popperRef['current']
      ? popperRef['current']['clientWidth']
      : undefined;

  useEffect(() => {
    // If the default changes and is not undefined then set it as selected
    if (defaultValue && defaultValue !== value) setValue(defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  return (
    <SelectDropdown
      value={value}
      buttonComponent={StyledButton}
      popperWidth={`${parentWidth}px`}
      landingPage={landingPage}
      onChange={(value: string | null) => {
        setValue(value);
        if (onSelectChange) onSelectChange(value);
      }}
    >
      {currencies.map((c) => {
        return (
          <StyledItem value={c} key={c} theme={theme}>
            <TokenIcon symbol={c} size="medium" />
            <H4 marginLeft={theme.spacing(1)}>{c}</H4>
          </StyledItem>
        );
      })}
    </SelectDropdown>
  );
}

export default CurrencySelect;
