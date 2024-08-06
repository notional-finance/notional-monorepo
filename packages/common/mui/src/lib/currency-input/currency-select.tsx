import { styled } from '@mui/material/styles';
import { Box, Button, useTheme } from '@mui/material';
import { Option } from '@mui/base';
import { TokenIcon } from '@notional-finance/icons';
import React, { ReactNode, useEffect, useState } from 'react';
import { SelectDropdown } from '../select-dropdown/select-dropdown';
import { Caption, H4, H5 } from '../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';
import CountUp from '../count-up/count-up';
import { TokenDefinition } from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import { WalletIcon } from '@notional-finance/icons';

export interface CurrencySelectOption {
  token: TokenDefinition;
  // Used for cases when we want to flip the prime cash / prime debt tokens
  displayToken?: TokenDefinition;
  content?: {
    largeFigure?: number;
    largeFigureDecimals?: number;
    largeFigureSuffix?: string;
    shouldCountUp?: boolean;
    caption?: React.ReactNode;
    largeCaption?: number;
    largeCaptionDecimals?: number;
    largeCaptionSuffix?: string;
    optionTitle?: React.ReactNode;
    balance?: string | undefined;
    error?: React.ReactNode | undefined;
    apy?: string | undefined;
  };
  disabled?: boolean;
}

export interface CurrencySelectProps {
  options: CurrencySelectOption[];
  defaultValue: string | null;
  onSelectChange?: (value: string | null) => void;
  popperRef?: React.ForwardedRef<unknown>;
  showScrollPopper?: boolean;
  minWidth?: string;
}

export function CurrencySelect({
  defaultValue,
  options,
  onSelectChange,
  popperRef,
  showScrollPopper,
  minWidth = '200px',
}: CurrencySelectProps) {
  const [value, setValue] = useState<string | null>(defaultValue);
  const theme = useTheme();

  const parentWidth =
    popperRef && popperRef['current']
      ? popperRef['current']['clientWidth']
      : undefined;

  useEffect(() => {
    if (defaultValue && value !== defaultValue) setValue(defaultValue);
  }, [defaultValue, value]);

  return (
    <SelectDropdown
      value={value}
      buttonComponent={StyledButton}
      popperWidth={parentWidth === undefined ? minWidth : `${parentWidth}px`}
      showScrollPopper={showScrollPopper}
      renderValue={(opt) =>
        opt ? (
          <Box sx={{ display: 'flex', marginRight: 'auto' }}>
            <TokenIcon symbol={opt.label as string} size="medium" />
            <H4 marginLeft={theme.spacing(1)}>{opt.label}</H4>
          </Box>
        ) : undefined
      }
      onChange={(value: string | null) => {
        setValue(value);
        if (onSelectChange) onSelectChange(value);
      }}
    >
      {options.map((o) => formatOption(o, theme))}
    </SelectDropdown>
  );
}

/**
 * NOTE: odd behavior in SelectUnstyled requires that this be called
 * as a regular function, not a JSX component
 */
export const formatOption = (
  option: CurrencySelectOption,
  theme: NotionalTheme,
  wrapInOption = true
) => {
  const { icon, titleWithMaturity } = formatTokenType(
    option.displayToken || option.token
  );
  let rightContent: ReactNode | undefined;
  let leftContent: ReactNode | undefined;

  if (option.content) {
    const c = option.content;

    leftContent = (
      <Box sx={{ display: 'flex' }}>
        {c?.error && <H4 marginLeft={theme.spacing(1)}>{c?.error}</H4>}
        {c?.largeCaption !== undefined && !c?.error && (
          <H4 marginLeft={theme.spacing(1)}>
            {c.shouldCountUp ? (
              <CountUp
                value={c?.largeCaption}
                suffix={c?.largeCaptionSuffix}
                decimals={c?.largeCaptionDecimals || 2}
              />
            ) : (
              `${c?.largeCaption.toFixed(c?.largeCaptionDecimals || 2)}${
                c?.largeCaptionSuffix
              }`
            )}
          </H4>
        )}
        {titleWithMaturity && !c?.largeCaptionSuffix && (
          <>
            <TokenIcon symbol={icon} size="medium" />
            <H4 marginLeft={theme.spacing(1)}>{titleWithMaturity}</H4>
          </>
        )}
      </Box>
    );

    const largeFigureNode =
      c.shouldCountUp && c.largeFigure !== undefined ? (
        <CountUp
          value={c.largeFigure}
          suffix={c.largeFigureSuffix}
          decimals={c.largeFigureDecimals || 2}
        />
      ) : (
        <span>
          {c.largeFigure !== undefined &&
            c.largeFigure.toFixed(c.largeFigureDecimals || 4)}
          {c.largeFigureSuffix}
        </span>
      );

    const apyNode = c.apy && (
      <Box
        sx={{
          marginRight: theme.spacing(2),
        }}
      >
        <H4>{c.apy}</H4>
        <Box sx={{ display: 'flex' }}>
          {c.balance && (
            <>
              <WalletIcon
                fill={theme.palette.typography.light}
                sx={{
                  fontSize: '12px',
                  position: 'relative',
                  top: '1px',
                  marginRight: theme.spacing(1),
                }}
              />
              <Caption>{c.balance}</Caption>
            </>
          )}
        </Box>
      </Box>
    );

    rightContent = (
      <Box textAlign={'right'}>
        {largeFigureNode && c.largeFigure !== undefined && !c?.error && (
          <H4
            sx={{ fontSize: c.caption ? '14px' : '16px' }}
            error={c.largeFigure < 0}
          >
            {largeFigureNode}
          </H4>
        )}
        {c?.error && <H4>--</H4>}
        {apyNode && apyNode}
        {c.caption ? <Caption>{c.caption}</Caption> : null}
      </Box>
    );
  }

  const child = (
    <Box sx={{ width: '100%' }}>
      {option.content?.optionTitle && (
        <H5 sx={{ padding: theme.spacing(2, 3) }} id="option-title">
          {option.content?.optionTitle}
        </H5>
      )}
      <Box
        id="main-option-content"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          height: theme.spacing(7),
        }}
      >
        {leftContent && <Box>{leftContent}</Box>}
        {rightContent && <Box textAlign="right">{rightContent}</Box>}
      </Box>
    </Box>
  );

  return wrapInOption ? (
    <StyledItem
      value={option.token.id}
      key={option.token.id}
      label={icon}
      theme={theme}
      disabled={option.disabled}
    >
      {child}
    </StyledItem>
  ) : (
    child
  );
};

export const EmptyCurrencySelectOption = (theme: NotionalTheme) => (
  <StyledItem key={'null'} value={'EMPTY'}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginRight: 'auto',
      }}
    >
      <TokenIcon size="medium" symbol={'unknown'} />
      <H4 marginLeft={theme.spacing(2)}>&nbsp;</H4>
    </Box>
    <Box textAlign={'right'}>
      <H4>&nbsp;</H4>
    </Box>
  </StyledItem>
);

const StyledItem = styled(Option)(
  ({ theme }) => `
  font-family: ${theme.typography.fontFamily};
  display: flex;
  line-height: 1.4;
  align-items: center;
  border-bottom: 1px solid ${theme.palette.borders.paper};
  :first-child {
    margin-top: ${theme.spacing(-1)};  
  }
  :last-child {
    border-bottom: none;
    margin-bottom: ${theme.spacing(-1)};
  }
  #main-option-content {
    padding: ${theme.spacing(3, 2)};
  }
  &:hover {
    #option-title {
      background: transparent;
    }
    #main-option-content {
      background-color: ${theme.palette.info.light};
      cursor: pointer;
    } 
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

export default CurrencySelect;
