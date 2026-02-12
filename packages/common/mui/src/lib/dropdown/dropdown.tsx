import { useState } from 'react';
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
}

const TextWrapper = styled('div', {
  shouldForwardProp: (prop: string) => prop !== 'buttonTextAlign',
})(
  ({ buttonTextAlign }: ButtonTextProps) => `
  display: flex;
  align-items: center;
  text-align: ${buttonTextAlign ? buttonTextAlign : 'center'};
`
);

const ArrowWrapper = styled(Box)(
  ({ theme }) => `
  background-color: ${theme.palette.info.light};
  border-radius: 50%;
  width: ${theme.spacing(2.5)};
  height: ${theme.spacing(2.5)};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
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
          borderRadius: theme.spacing(2.5),
          minWidth: theme.spacing(20.5),
          height: theme.spacing(5.5),
          padding: theme.spacing(1.5, 2),
          gap: theme.spacing(3),
          color: theme.palette.typography.light,
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: '20px',
          textTransform: 'none',
          background: theme.palette.common.white,
          border: 'none',
          boxShadow: 'none',
          justifyContent: 'center',
          '& .MuiButton-endIcon': {
            margin: 0,
          },
          '& .MuiButton-startIcon': {
            margin: 0,
          },
          '&:hover': {
            background: theme.palette.common.white,
            border: 'none',
            boxShadow: 'none',
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
                  transform: `rotate(${open ? '0' : '180'}deg)`,
                  transition: 'transform .25s ease-in-out',
                  color: theme.palette.primary.light,
                  width: theme.spacing(1.5),
                  height: theme.spacing(1.5),
                }}
              />
            </ArrowWrapper>
          )
        }
      >
        <TextWrapper buttonTextAlign={buttonTextAlign}>
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
          sx: {
            minWidth: anchorEl && anchorEl.offsetWidth,
            padding: theme.spacing(1),
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius(),
            marginTop: theme.spacing(0.5),
            boxShadow: theme.shape.shadowStandard,
          },
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
              borderRadius: theme.shape.borderRadius(),
              width: '100%',
              margin: 0,
              padding: theme.spacing(1.5, 1.25),
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
