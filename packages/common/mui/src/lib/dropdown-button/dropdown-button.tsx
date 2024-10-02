import {
  Button,
  Box,
  ButtonProps,
  PopoverOrigin,
  PopoverPosition,
  PopoverReference,
  useTheme,
} from '@mui/material';
import { ArrowIcon } from '@notional-finance/icons';
import { ReactElement, ReactNode, useRef } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import HoverPopover from 'material-ui-popup-state/HoverPopover';
import {
  usePopupState,
  bindHover,
  bindPopover,
} from 'material-ui-popup-state/hooks';

 
export interface DropdownButtonProps extends ButtonProps {
  popupId?: string;
  icon?: ReactElement;
  labelKey?: MessageDescriptor;
  children: ReactNode;
  anchorReference?: PopoverReference;
  anchorPosition?: PopoverPosition;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  buttonChildren?: ReactNode;
  customPopOverStyles?: Record<any, any>;
  activeTab?: boolean;
  hideOnClick?: boolean;
  useStroke?: boolean;
}

export function DropdownButton({
  popupId = 'dropdown-menu',
  icon,
  labelKey,
  anchorPosition = { top: 0, left: 0 },
  anchorReference = 'anchorPosition',
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  transformOrigin = { vertical: 'top', horizontal: 'right' },
  buttonChildren,
  children,
  customPopOverStyles,
  activeTab = false,
  hideOnClick = true,
  useStroke = false,
  sx,
  ...rest
}: DropdownButtonProps) {
  const popupState = usePopupState({
    variant: 'popover',
    popupId,
  });
  const theme = useTheme();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const bindHoverData = hideOnClick ? bindHover(popupState) : null;
  const svgKey = useStroke ? 'stroke' : 'fill';

  return (
    <Box sx={{ minHeight: '100%', display: 'flex' }}>
      <Box
        sx={{
          minHeight: '100%',
          position: 'relative',
          display: 'block',
          alignItems: 'center',
        }}
      >
        <Button
          ref={btnRef}
          {...bindHover(popupState)}
          // onClick={() => popupState.open()} // Debugging
          startIcon={icon}
          endIcon={
            <ArrowIcon
              className="dropdown-arrow"
              sx={{
                transform: `rotate(${popupState.isOpen ? '0' : '180'}deg)`,
                transition: 'transform .5s ease-in-out',
              }}
            />
          }
          aria-describedby="dropdown-menu"
          sx={{
            minHeight: '100%',
            'span.MuiButton-endIcon > svg.dropdown-arrow': {
              fontSize: '.875rem',
            },
            'span.MuiButton-startIcon>*:nth-of-type(1)': {
              fontSize: '1.125rem',
            },
            position: 'relative',
            top: 0,
            left: 0,
            fontSize: '1rem',
            svg: {
              fill: useStroke ? 'transparent' : '',
              [svgKey]: popupState.isOpen
                ? theme.palette.primary.light
                : theme.palette.common.black,
            },
            ':hover': {
              background: 'unset',
            },
            color: popupState.isOpen
              ? theme.palette.primary.light
              : theme.palette.common.black,
            ...sx,
          }}
          {...rest}
        >
          {labelKey && <FormattedMessage {...labelKey} />}
          {buttonChildren}
        </Button>
        {activeTab && (
          <Box
            sx={{
              marginTop: '-4px',
              width: '100%',
              height: '4px',
              background: theme.palette.typography.accent,
            }}
          ></Box>
        )}
      </Box>
      <HoverPopover
        {...bindPopover(popupState)}
        keepMounted
        transitionDuration={400}
        anchorReference={anchorReference}
        anchorPosition={anchorPosition}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        marginThreshold={0}
        onClick={popupState.close}
        disableScrollLock
        {...bindHoverData}
        sx={{
          '.MuiPopover-paper': {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            marginBottom: '40px',
            ...customPopOverStyles,
          },
        }}
      >
        {children}
      </HoverPopover>
    </Box>
  );
}

export default DropdownButton;
