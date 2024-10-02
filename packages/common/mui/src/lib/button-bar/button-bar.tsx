import { ReactNode } from 'react';
import { Box, ButtonGroup, Button, SxProps, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ProgressIndicator from '../progress-indicator/progress-indicator';

 
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
  barPosition?: 'absolute' | 'relative';
  sx?: SxProps;
}

export const ButtonBar = ({
  buttonOptions,
  buttonVariant = 'contained',
  customButtonColor,
  customButtonBGColor,
  barPosition,
  sx,
}: ButtonBarPropType) => {
  const theme = useTheme();
  const baseButtonColor = customButtonBGColor
    ? customButtonBGColor
    : theme.palette.primary.light;
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
