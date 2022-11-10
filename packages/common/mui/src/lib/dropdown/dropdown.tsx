import { useState } from 'react';
import { NotionalTheme } from '@notional-finance/styles';
import { ArrowIcon } from '@notional-finance/icons';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import {
  useTheme,
  Box,
  Button,
  Menu,
  MenuProps,
  styled,
  MenuItem,
  ListItemIcon,
} from '@mui/material';

export interface DropdownItem {
  label: string;
  href: string;
  Icon?: any;
}

export interface DropdownProps extends MenuProps {
  ButtonStartIcon?: any;
  ButtonEndIcon?: any;
  buttonTextAlign?: string;
  dropDownItems: DropdownItem[];
  buttonText: MessageDescriptor;
}

export interface ButtonTextProps {
  buttonTextAlign?: string;
  theme: NotionalTheme;
}

const TextWrapper = styled('div', {
  shouldForwardProp: (prop: string) => prop !== 'buttonTextAlign',
})(
  ({ buttonTextAlign }: ButtonTextProps) => `
  flex: 1;
  text-align: ${buttonTextAlign ? buttonTextAlign : 'center'};
`
);

const DropdownButton = styled(Button)`
  width: 100%;
  text-transform: capitalize;
  justify-content: flex-start;
  padding: 1.25rem;
  font-size: 1rem;
  font-weight: 700;
`;

const ArrowWrapper = styled(Box)(
  ({ theme: { palette } }) => `
  background-color: ${palette.primary.light};
  border-radius: 50%;
  width: 28px;
`
);

export function Dropdown({
  ButtonStartIcon,
  ButtonEndIcon,
  buttonTextAlign,
  dropDownItems,
  buttonText,
}: DropdownProps) {
  const theme = useTheme();
  // @ts-ignore
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const LastMenuItem = dropDownItems[dropDownItems.length - 1];
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <DropdownButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        variant="contained"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={ButtonStartIcon && <ButtonStartIcon />}
        endIcon={
          ButtonEndIcon ? (
            <ButtonEndIcon />
          ) : (
            <ArrowWrapper>
              <ArrowIcon
                sx={{
                  color: theme.palette.common.white,
                  backgroundColor: theme.palette.primary.light,
                  fontSize: '.875rem',
                  fontWeight: 800,
                  transform: `rotate(${open ? '0' : '180'}deg)`,
                  transition: 'transform .5s ease-in-out',
                }}
              />
            </ArrowWrapper>
          )
        }
      >
        <TextWrapper buttonTextAlign={buttonTextAlign} theme={theme}>
          <FormattedMessage {...buttonText} />
        </TextWrapper>
      </DropdownButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transitionDuration={{ exit: 0, enter: 200 }}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
          sx: { minWidth: anchorEl && anchorEl.offsetWidth },
        }}
      >
        {dropDownItems.map(({ label, Icon, href }, index) => (
          <MenuItem
            key={`${label}-${index}`}
            onClick={handleClose}
            component="a"
            target="_blank"
            href={href}
            sx={{
              borderBottom: LastMenuItem.label === label ? 'none' : theme.shape.borderStandard,
              width: '90%',
              margin: 'auto',
              padding: '15px 10px',
            }}
          >
            {Icon && (
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
            )}
            {label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default Dropdown;
