import { ReactNode } from 'react';
import { Box, ButtonGroup, Button, SxProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ProgressIndicator from '../progress-indicator/progress-indicator';

/* eslint-disable-next-line */
export type ButtonOptionsType = {
  buttonText: ReactNode;
  callback: () => void;
  disabled?: boolean;
  active?: boolean;
};

interface ButtonBarPropType {
  buttonOptions: ButtonOptionsType[];
  buttonVariant?: 'outlined' | 'contained';
  customButtonColor?: string;
  customButtonBGColor?: string;
  sx?: SxProps;
}

export const ButtonBar = ({
  buttonOptions,
  buttonVariant = 'contained',
  customButtonColor,
  customButtonBGColor,
  sx,
}: ButtonBarPropType) => {
  const theme = useTheme();
  const baseButtonColor = customButtonBGColor
    ? customButtonBGColor
    : theme.palette.primary.light;
  return (
    <div>
      {buttonOptions.length > 0 ? (
        <ButtonGroup
          aria-label="button group"
          variant={buttonVariant}
          sx={{ boxShadow: 'none', ...sx }}
        >
          {buttonOptions.map(
            ({ buttonText, callback, disabled, active }, index) => (
              <Button
                key={`button-${index}`}
                onClick={callback}
                disabled={disabled}
                sx={{
                  padding: theme.spacing(1, 4),
                  borderColor:
                    buttonVariant === 'contained'
                      ? `${theme.palette.common.white} !important`
                      : baseButtonColor,
                  textTransform: 'capitalize',
                  color:
                    active && customButtonColor
                      ? customButtonColor
                      : active && !customButtonColor
                      ? theme.palette.typography.contrastText
                      : buttonVariant === 'contained'
                      ? theme.palette.typography.contrastText
                      : baseButtonColor,
                  background:
                    buttonVariant === 'contained' || active
                      ? baseButtonColor
                      : 'transparent',
                  borderRadius: theme.shape.borderRadius(),
                  '&:hover': {
                    background:
                      active && buttonVariant === 'outlined'
                        ? baseButtonColor
                        : '',
                  },
                }}
              >
                {buttonText}
              </Button>
            )
          )}
        </ButtonGroup>
      ) : (
        <Box sx={{ width: theme.spacing(25), display: 'flex' }}>
          <ProgressIndicator size={24} />
        </Box>
      )}
    </div>
  );
};

export default ButtonBar;
