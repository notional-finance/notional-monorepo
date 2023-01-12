import { ReactNode } from 'react';
import { Box, ButtonGroup, Button, SxProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ProgressIndicator from '../progress-indicator/progress-indicator';

/* eslint-disable-next-line */
export type ButtonOptionsType = {
  buttonText: ReactNode;
  disabled?: boolean;
  callback: () => void;
};

interface ButtonBarPropType {
  buttonOptions: ButtonOptionsType[];
  buttonVariant?: 'outlined' | 'contained';
  sx?: SxProps;
}

export const ButtonBar = ({
  buttonOptions,
  buttonVariant = 'contained',
  sx,
}: ButtonBarPropType) => {
  const theme = useTheme();
  return (
    <div>
      {buttonOptions.length > 0 ? (
        <ButtonGroup
          aria-label="button group"
          variant={buttonVariant}
          sx={{ boxShadow: 'none', ...sx }}
        >
          {buttonOptions.map(({ buttonText, callback, disabled }, index) => (
            <Button
              key={`button-${index}`}
              onClick={callback}
              disabled={disabled}
              sx={{
                padding: theme.spacing(1, 4),
                borderColor:
                  buttonVariant === 'contained'
                    ? `${theme.palette.common.white} !important`
                    : theme.palette.primary.light,
                textTransform: 'capitalize',
                color:
                  buttonVariant === 'contained'
                    ? theme.palette.typography.contrastText
                    : theme.palette.primary.light,
                background:
                  buttonVariant === 'contained'
                    ? theme.palette.primary.light
                    : 'transparent',
                borderRadius: theme.shape.borderRadius(),
              }}
            >
              {buttonText}
            </Button>
          ))}
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
