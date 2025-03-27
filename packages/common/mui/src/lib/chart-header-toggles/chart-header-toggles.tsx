import {
  alpha,
  Box,
  BoxProps,
  styled,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useState } from 'react';

interface ChartHeaderTogglesProps {
  headerButtons: {
    label: string;
    value: string;
    onClick: () => void;
  }[];
  containerProps?: BoxProps;
}

export const ChartHeaderToggles = ({
  headerButtons,
  containerProps,
}: ChartHeaderTogglesProps) => {
  const [selectedButton, setSelectedButton] = useState(headerButtons[0].value);

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    setSelectedButton(newAlignment);
    headerButtons.find((button) => button.value === newAlignment)?.onClick();
  };

  return (
    <Container {...containerProps}>
      <CustomToggleButtonGroup
        exclusive
        size="small"
        value={selectedButton}
        onChange={handleChange}
      >
        {headerButtons.map((button) => (
          <CustomToggleButton
            key={button.value}
            value={button.value}
            selected={button.value === selectedButton}
          >
            {button.label}
          </CustomToggleButton>
        ))}
      </CustomToggleButtonGroup>
    </Container>
  );
};

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  right: theme.spacing(20),
  top: theme.spacing(3),
}));

const CustomToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexDirection: 'row',
  gap: theme.spacing(1),
  marginRight: theme.spacing(7.5),
}));

const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
  borderRadius: `${theme.spacing(0.5)} !important`,
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(0.5, 0.75),
  color: theme.palette.typography.light,
  border: 'none',
  '&:hover': {
    backgroundColor: theme.palette.background.default,
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.light, 0.1),
    color: theme.palette.primary.light,
  },
}));
