import { ReactNode } from 'react';
import { Box, ButtonGroup, SxProps, styled } from '@mui/material';
import { Button } from '../button/button';
import { useTheme } from '@mui/material/styles';
import ProgressIndicator from '../progress-indicator/progress-indicator';

/* eslint-disable-next-line */
export type ButtonOptionsType = {
  buttonText: ReactNode;
  callback?: () => void;
  link?: string;
  disabled?: boolean;
  active?: boolean;
};

interface ButtonBarPropType {
  buttonOptions: ButtonOptionsType[];
  buttonVariant?: 'outlined' | 'contained';
  customButtonColor?: string;
  barPosition?: 'absolute' | 'relative';
  sx?: SxProps;
}

export const ButtonBar = ({
  buttonOptions,
  buttonVariant = 'contained',
  customButtonColor,
  barPosition,
  sx,
}: ButtonBarPropType) => {
  const theme = useTheme();
  return (
    <div
      style={{
        position: barPosition,
        marginBottom: barPosition === 'absolute' ? theme.spacing(6) : '0px',
      }}
    >
      {buttonOptions.length > 0 ? (
        <ButtonBarGroup
          aria-label="button group"
          variant={buttonVariant}
          sx={{ ...sx }}
        >
          {buttonOptions.map(
            ({ buttonText, callback, disabled, active, link = '' }, index) => (
              <Button
                data-dd-action-name={`${link}`}
                to={disabled ? undefined : link}
                key={`button-${index}`}
                onClick={disabled ? undefined : callback}
                disabled={disabled}
                variant={buttonVariant}
                size="medium"
                sx={{
                  borderColor:
                    buttonVariant === 'contained'
                      ? `${theme.palette.common.white} !important`
                      : theme.palette.primary.light,
                  color:
                    active && customButtonColor
                      ? customButtonColor
                      : active && !customButtonColor
                      ? theme.palette.typography.contrastText
                      : buttonVariant === 'contained'
                      ? theme.palette.typography.contrastText
                      : theme.palette.primary.light,
                  background:
                    buttonVariant === 'contained' || active
                      ? theme.palette.primary.light
                      : 'transparent',
                  '&:hover': {
                    background:
                      active && buttonVariant === 'outlined'
                        ? theme.palette.primary.light
                        : '',
                  },
                }}
              >
                {buttonText}
              </Button>
            )
          )}
        </ButtonBarGroup>
      ) : (
        <Box sx={{ width: theme.spacing(25), display: 'flex' }}>
          <ProgressIndicator size={24} />
        </Box>
      )}
    </div>
  );
};

const ButtonBarGroup = styled(ButtonGroup)(
  ({ theme }) => `
  box-shadow: none;
  ${theme.breakpoints.down('sm')} {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing(3)};
      button {
        border-radius: ${theme.shape.borderRadius()} !important;
      }
  }
`
);

export default ButtonBar;
