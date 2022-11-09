import { MenuList, PopperPlacementType, styled, useTheme } from '@mui/material';
import SelectUnstyled from '@mui/base/SelectUnstyled';
import PopperUnstyled from '@mui/base/PopperUnstyled';
import { ArrowIcon } from '@notional-finance/icons';
import { ElementType, useState } from 'react';

interface SelectDropdownProps {
  children: React.ReactNode[];
  landingPage: boolean;
  value: any;
  buttonComponent: ElementType;
  onChange: (value: any) => void;
  onListboxOpen?: (isOpen: boolean) => void;
}

const StyledMenu = styled(MenuList)(
  ({ theme }) => `
  width: 447px;
  margin-top: 0.5rem;
  outline: none;
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  box-shadow: ${theme.shape.shadowStandard};
  background-color: ${theme.palette.common.white};
  `
);
const StyledPopper = styled(PopperUnstyled)`
  z-index: 1;
`;

export const SelectDropdown = ({
  children,
  landingPage,
  buttonComponent,
  onListboxOpen,
  onChange,
  value,
}: SelectDropdownProps) => {
  const theme = useTheme();
  const [isListboxOpen, setListboxOpen] = useState(false);
  const onlyOneInput = children.length === 1;

  const components = {
    Root: buttonComponent,
    Listbox: StyledMenu,
    Popper: StyledPopper,
  };

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
          color: landingPage ? theme.palette.common.white : theme.palette.common.black,
        },
        '&:hover': {
          backgroundColor: landingPage
            ? 'rgba(248, 250, 250, 0.05)'
            : theme.palette.background.default,
        },
      },
    },
    listbox: {
      theme,
    },
    popper: {
      popperOptions: {
        placement: 'bottom-end' as PopperPlacementType,
      },
      theme,
    },
  };

  return (
    <SelectUnstyled
      value={value}
      disabled={onlyOneInput}
      componentsProps={componentProps}
      components={components}
      onListboxOpenChange={(isOpen: boolean) => {
        setListboxOpen(isOpen);
        if (onListboxOpen) onListboxOpen(isOpen);
      }}
      onChange={onChange}
    >
      {children}
    </SelectUnstyled>
  );
};
