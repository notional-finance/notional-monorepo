import { ArrowIcon } from '@notional-finance/icons';
import { H4, Subtitle } from '../typography/typography';
import { useTheme, Box, Button, styled, Popover, SxProps } from '@mui/material';
import { ReactNode, useState } from 'react';

export interface SimpleOptionProps {
  label: ReactNode;
  callback: () => void;
}

export interface SimpleDropdown {
  options: SimpleOptionProps[];
  title: ReactNode;
  altDropdownArrow?: boolean;
  innerWrapperSx?: SxProps;
  sx?: SxProps;
}

export const DropdownOption = ({ label, callback, handleClose }) => {
  const theme = useTheme();

  const handleOptionClick = () => {
    handleClose();
    callback();
  };

  return (
    <Option>
      <H4
        onClick={handleOptionClick}
        sx={{
          flex: 1,
          alignItems: 'center',
          display: 'flex',
          fontWeight: 500,
          padding: theme.spacing(2),
          borderBottom: theme.shape.borderStandard,
          '&:hover': {
            background: theme.palette.info.light,
          },
        }}
      >
        {label}
      </H4>
    </Option>
  );
};

export function SimpleDropdown({
  options,
  title,
  sx,
  innerWrapperSx,
  altDropdownArrow,
}: SimpleDropdown) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<any>(null);
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
        sx={{
          width: 'fit-content',
          height: '42px',
          ...sx,
        }}
        endIcon={
          <Box
            sx={{
              marginLeft: theme.spacing(1),
              height: theme.spacing(2),
              width: theme.spacing(2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: altDropdownArrow ? '50%' : '',
              background: altDropdownArrow ? theme.palette.info.light : '',
            }}
          >
            <ArrowIcon
              sx={{
                transform: open ? 'rotate(0deg)' : 'rotate(-180deg)',
                transition: '.5s ease',
                width: altDropdownArrow ? theme.spacing(1.5) : theme.spacing(2),
                color: altDropdownArrow
                  ? theme.palette.secondary.light
                  : theme.palette.common.white,
              }}
            />
          </Box>
        }
      >
        <Subtitle>{title}</Subtitle>
      </DropdownButton>
      <Popover
        id="basic-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        transitionDuration={{ exit: 0, enter: 200 }}
        sx={{
          marginTop: theme.spacing(1),
          '.MuiPopover-paper': {
            boxShadow: theme.shape.shadowLarge(),
            borderRadius: theme.shape.borderRadius(),
            border: theme.shape.borderStandard,
            width: {
              xs: '100%',
              sm: '100%',
              md: 'auto',
              lg: 'auto',
              xl: 'auto',
            },
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <InnerWrapper id="inner-dropdown" sx={{ ...innerWrapperSx }}>
          <Box sx={{ margin: 'auto' }}>
            {options.map(({ label, callback }, i) => (
              <DropdownOption
                key={i}
                label={label}
                callback={callback}
                handleClose={handleClose}
              />
            ))}
          </Box>
        </InnerWrapper>
      </Popover>
    </Box>
  );
}

const InnerWrapper = styled(Box)(
  ({ theme }) => `
    width: 350px;
    border-radius: ${theme.shape.borderRadius()};
    ${theme.breakpoints.down('sm')} {
      width: 100%;
      padding: ${theme.spacing(2)};
    }
  `
);

const DropdownButton = styled(Button)(
  ({ theme }) => `
  transition: none;
  h6 {
    color: ${theme.palette.common.white};
  };
  padding: ${theme.spacing(2)};
  justify-content: flex-start;
  background: ${theme.palette.primary.light};
  border-radius: ${theme.shape.borderRadius()};
  box-shadow: none;
  &:hover {
    box-shadow: none;
  }
`
);

const Option = styled(Box)(
  ({ theme }) => `
    cursor: pointer;
    width: 100%;
    justify-content: flex-start;
    background: ${theme.palette.common.white};
    `
);

export default SimpleDropdown;
