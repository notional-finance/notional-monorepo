import { useState } from 'react';
import { NotionalTheme } from '@notional-finance/styles';
import { ArrowIcon } from '@notional-finance/icons';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import {
  useTheme,
  Box,
  Menu,
  MenuProps,
  styled,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { Button } from '../button/button';
import { trackOutboundLink } from '@notional-finance/helpers';

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

const ArrowWrapper = styled(Box)(
  ({ theme }) => `
  background-color: ${theme.palette.info.light};
  border-radius: 50%;
  margin-left: ${theme.spacing(2)};
  padding: ${theme.spacing(0.5)};
  display: flex;
  align-items: center;
  justify-content: center;
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

  const handleClose = (href?: string) => {
    setAnchorEl(null);
    if (href) trackOutboundLink(href);
  };

  return (
    <Box>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        variant="outlined"
        size="medium"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={{
          borderRadius: theme.spacing(4),
          padding: theme.spacing(1, 2),
          color: theme.palette.typography.light,
          background: theme.palette.background.paper,
          border: theme.shape.borderStandard,
          '&:hover': {
            border: theme.shape.borderStandard,
          },
        }}
        startIcon={ButtonStartIcon && <ButtonStartIcon />}
        endIcon={
          ButtonEndIcon ? (
            <ButtonEndIcon />
          ) : (
            <ArrowWrapper>
              <ArrowIcon
                sx={{
                  color: theme.palette.primary.main,
                  transform: `rotate(${open ? '0' : '180'}deg)`,
                  transition: 'transform .5s ease-in-out',
                  width: theme.spacing(2),
                  height: theme.spacing(2),
                }}
              />
            </ArrowWrapper>
          )
        }
      >
        <TextWrapper buttonTextAlign={buttonTextAlign} theme={theme}>
          <FormattedMessage {...buttonText} />
        </TextWrapper>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        transitionDuration={{ exit: 0, enter: 200 }}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
          sx: { minWidth: anchorEl && anchorEl.offsetWidth },
        }}
      >
        {dropDownItems.map(({ label, Icon, href }, index) => (
          <MenuItem
            key={`${label}-${index}`}
            onClick={() => handleClose(href)}
            component="a"
            target="_blank"
            href={href}
            sx={{
              borderBottom:
                LastMenuItem.label === label
                  ? 'none'
                  : theme.shape.borderStandard,
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
