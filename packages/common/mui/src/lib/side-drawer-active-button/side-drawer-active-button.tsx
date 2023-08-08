import { styled, Box, useTheme } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CircleIcon } from '@notional-finance/icons';
import { ReactNode } from 'react';
import { H4 } from '../typography/typography';

export interface SideDrawerActiveButtonProps {
  label: ReactNode;
  callback: (dataKey) => void;
  dataKey: string;
  selectedKey?: string;
  Icon?: any;
  disabled?: boolean;
}

export function SideDrawerActiveButton({
  label,
  dataKey,
  selectedKey,
  callback,
  Icon,
  disabled = false,
}: SideDrawerActiveButtonProps) {
  const theme = useTheme();
  return (
    <WalletButton
      onClick={() => callback(dataKey)}
      active={selectedKey === dataKey}
      theme={theme}
      disabled={disabled}
    >
      {Icon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icon}
        </Box>
      )}
      <H4
        sx={{ whiteSpace: 'nowrap', marginLeft: theme.spacing(3) }}
        fontWeight="regular"
      >
        {label}
      </H4>
      <Box
        sx={{
          justifyContent: 'flex-end',
          display: 'flex',
          width: '100%',
        }}
      >
        {selectedKey === dataKey ? (
          <CheckCircleIcon sx={{ fill: theme.palette.primary.main }} />
        ) : (
          <CircleIcon
            sx={{
              stroke: theme.palette.borders.accentPaper,
              width: theme.spacing(2.5),
              height: theme.spacing(2.5),
            }}
          />
        )}
      </Box>
    </WalletButton>
  );
}

const WalletButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active' && prop !== 'disabled',
})(
  ({
    theme,
    active,
    disabled,
  }: {
    active: boolean;
    disabled: boolean;
    theme: NotionalTheme;
  }) => `
  padding: ${theme.spacing(2.5)};
  border-radius: ${theme.shape.borderRadius()};
  border: 1px solid ${
    active ? theme.palette.primary.main : theme.palette.borders.paper
  };
  margin: ${theme.spacing(1)} 0px;
  cursor: ${disabled ? 'not-allowed' : 'pointer'};
  background: ${
    active && !disabled
      ? theme.palette.info.light
      : !active && disabled
      ? theme.palette.borders.default
      : theme.palette.common.white
  };
  color: ${theme.palette.primary.dark};
  font-weight: 500;
  display: flex;
  align-items: center;
  ${
    !disabled
      ? `&:hover {
    transition: .5s ease;
    background: ${theme.palette.info.light};
  }`
      : ''
  }
  `
);

export default SideDrawerActiveButton;
