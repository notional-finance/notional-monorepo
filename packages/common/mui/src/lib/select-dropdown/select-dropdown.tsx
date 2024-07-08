import {
  MenuList,
  PopperPlacementType,
  SxProps,
  styled,
  useTheme,
} from '@mui/material';
import SelectUnstyled, { SelectOption } from '@mui/base/SelectUnstyled';
import PopperUnstyled from '@mui/base/PopperUnstyled';
import { ArrowIcon } from '@notional-finance/icons';
import { ElementType, useState } from 'react';

interface SelectDropdownProps {
  children: React.ReactNode[];
  landingPage?: boolean;
  value: string | null;
  popperWidth?: string;
  buttonComponent: ElementType;
  onChange: (value: string | null) => void;
  onListboxOpen?: (isOpen: boolean) => void;
  renderValue?: (
    option: SelectOption<string> | null
  ) => React.ReactNode | undefined;
  sx?: SxProps;
  showScrollPopper?: boolean;
}

const StyledMenu = styled(MenuList)(
  ({ theme }) => `
  width: inherit;
  margin-top: 0.5rem;
  outline: none;
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  box-shadow: ${theme.shape.shadowStandard};
  background-color: ${theme.palette.common.white};
  `
);

const StyledPopper = styled(PopperUnstyled)(`
  z-index: 99;
`);

const ScrollPopper = styled(PopperUnstyled)(
  ({ theme }) => `
  z-index: 99;
  height: ${theme.spacing(41)};
  overflow-y: scroll;
  overflow-x: hidden;
`
);

export const SelectDropdown = ({
  children,
  landingPage,
  popperWidth,
  buttonComponent,
  onListboxOpen,
  onChange,
  renderValue,
  value,
  showScrollPopper = false,
}: SelectDropdownProps) => {
  const theme = useTheme();
  const [isListboxOpen, setListboxOpen] = useState(false);
  const onlyOneInput = children.length === 1;

  const components = {
    root: buttonComponent,
    listbox: StyledMenu,
    popper: showScrollPopper ? ScrollPopper : StyledPopper,
  };

  const popperPlacement =
    window.innerWidth <= theme.breakpoints.values.sm
      ? 'bottom'
      : ('bottom-end' as PopperPlacementType);

  const componentProps = {
    root: {
      id: 'currency-select-button',
      disableRipple: true,
      endIcon: (
        <ArrowIcon
          sx={{
            height: '0.75rem',
            maxWidth: '0.75rem',
            transform: `rotate(${isListboxOpen ? '0' : '180'}deg)`,
            transition: 'transform 0.3s ease-in-out',
            borderRadius: '50%',
            width: '0.75rem',
            padding: '4px',
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.common.white,
            visibility: onlyOneInput ? 'hidden' : 'visible',
            boxSizing: 'unset',
          }}
        />
      ),
      theme,
      sx: {
        backgroundColor: landingPage ? 'unset' : theme.palette.common.white,
        borderRadius: theme.shape.borderRadius(),
        h4: {
          color: landingPage
            ? theme.palette.common.white
            : theme.palette.common.black,
        },
        '&:hover': {
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '0px',
          borderTopRightRadius: theme.shape.borderRadius(),
          borderBottomRightRadius: theme.shape.borderRadius(),
          backgroundColor: landingPage
            ? 'rgba(248, 250, 250, 0.05)'
            : theme.palette.info.light,
        },
      },
    },
    listbox: {
      theme,
    },
    popper: {
      // open: true, // NOTE: uncomment this to keep the list box open when debugging
      popperOptions: {
        placement: popperPlacement,
        // If no popper width is set manually, enforce that it matches the width of the
        // select button component
        modifiers: [
          {
            name: 'sameWidth',
            enabled: true,
            phase: 'beforeWrite',
            requires: ['computeStyles'],
            fn: ({ state }) => {
              state.styles.popper.width =
                popperWidth || `${state.rects.reference.width}px`;
            },
            effect: ({ state }) => {
              state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
            },
          },
        ],
      },
      theme,
    },
  };

  return (
    <SelectUnstyled
      disabled={onlyOneInput}
      value={value}
      slotProps={componentProps}
      slots={components}
      renderValue={renderValue}
      onListboxOpenChange={(isOpen: boolean) => {
        setListboxOpen(isOpen);
        if (onListboxOpen) onListboxOpen(isOpen);
      }}
      onChange={(_, value) => {
        onChange(value);
      }}
    >
      {children}
    </SelectUnstyled>
  );
};
