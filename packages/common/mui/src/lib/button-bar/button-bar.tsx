import { ButtonGroup, Button, SxProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/* eslint-disable-next-line */
export type ButtonOptionsType = {
  buttonText: string;
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
            padding: '8px 32px',
            borderColor:
              buttonVariant === 'contained'
                ? `${theme.palette.common.white} !important`
                : theme.palette.primary.main,
            textTransform: 'capitalize',
            color:
              buttonVariant === 'contained'
                ? theme.palette.typography.contrastText
                : theme.palette.primary.main,
            background: buttonVariant === 'contained' ? theme.palette.primary.main : 'transparent',
            borderRadius: theme.shape.borderRadius(),
          }}
        >
          {buttonText}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default ButtonBar;
