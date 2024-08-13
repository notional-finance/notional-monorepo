import { Box, useTheme, styled, Button } from '@mui/material';
import { MessageDescriptor } from 'react-intl';
import { TokenDefinition } from '@notional-finance/core-entities';
import {
  EmptyCurrencySelectOption,
  formatOption,
} from '../currency-input/currency-select';
import { Paragraph } from '../typography/typography';
import { SelectDropdown } from '../select-dropdown/select-dropdown';
import { InputLabel } from '../input-label/input-label';
import React from 'react';

interface AssetSelectDropdownProps {
  inputLabel?: MessageDescriptor;
  errorMsg?: MessageDescriptor;
  tightMarginTop?: boolean;
  selectedTokenId?: string;
  onSelect: (id: string | null) => void;
  options?: {
    token: TokenDefinition;
    largeFigure: number;
    largeFigureDecimals?: number;
    largeFigureSuffix: string;
    caption?: React.ReactNode;
    largeCaption?: number;
    largeCaptionDecimals?: number;
    largeCaptionSuffix?: string;
    disabled?: boolean;
    optionTitle?: React.ReactNode;
    error?: React.ReactNode;
  }[];
  caption?: React.ReactNode;
}

const StyledButton = styled(Button)(
  ({ theme }) => `
    color: unset;
    text-transform: unset;
    width: 100%;
    padding-right: ${theme.spacing(2)};
    padding-left: ${theme.spacing(2)};
    border-radius: ${theme.shape.borderRadius()};
    border: ${theme.shape.borderStandard};
    height: ${theme.spacing(7)};
    .MuiButton-endIcon {
      margin-right: 0px;
    }
  `
);

export const AssetSelectDropdown = ({
  inputLabel,
  tightMarginTop,
  selectedTokenId,
  onSelect,
  options,
  caption,
}: AssetSelectDropdownProps) => {
  const theme = useTheme();
  const emptyOption = EmptyCurrencySelectOption(theme);

  const selectOptions = options?.map(
    ({
      token,
      largeFigure,
      largeFigureDecimals,
      largeFigureSuffix,
      caption,
      disabled,
      largeCaption,
      largeCaptionDecimals,
      largeCaptionSuffix,
      optionTitle,
      error,
    }) => {
      return formatOption(
        {
          token: token,
          content: {
            optionTitle,
            error,
            largeFigure,
            largeFigureDecimals,
            largeCaption,
            largeCaptionDecimals,
            largeCaptionSuffix,
            largeFigureSuffix,
            shouldCountUp: false,
            caption,
          },
          disabled,
        },
        theme
      );
    }
  ) || [emptyOption];
  const inputBoxRef = React.useRef(null);
  const parentWidth =
    inputBoxRef && inputBoxRef['current']
      ? inputBoxRef['current']['clientWidth']
      : undefined;

  return (
    <Box
      marginTop={tightMarginTop ? theme.spacing(-3) : undefined}
      ref={inputBoxRef}
    >
      <InputLabel inputLabel={inputLabel} />
      <SelectDropdown
        buttonComponent={StyledButton}
        value={selectedTokenId || null}
        popperWidth={parentWidth || '447px'}
        onChange={onSelect}
        renderValue={(opt) => {
          const o = options?.find(({ token }) => token?.id === opt?.value);
          return o
            ? formatOption(
                {
                  token: o.token,
                  content: {
                    error: o.error,
                    largeCaption: o.largeCaption,
                    largeCaptionDecimals: o.largeCaptionDecimals,
                    largeFigureDecimals: o.largeFigureDecimals,
                    largeCaptionSuffix: o.largeCaptionSuffix,
                    largeFigure: o.largeFigure,
                    largeFigureSuffix: o.largeFigureSuffix,
                    shouldCountUp: true,
                    caption: o.caption,
                  },
                },
                theme,
                false
              )
            : undefined;
        }}
      >
        {selectOptions}
      </SelectDropdown>
      {caption && (
        <Paragraph marginTop={theme.spacing(1)}>
          {caption || '\u00A0'}
        </Paragraph>
      )}
    </Box>
  );
};
