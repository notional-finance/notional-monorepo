// material-ui
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

// ==============================|| MAP BOX - CONTROL STYLED ||============================== //

const ControlPanelStyled = styled(Box)(({ theme }) => ({
  backdropFilter: `blur(4px)`,
  WebkitBackdropFilter: `blur(4px)`,
  background: alpha(theme.palette.background.paper, 0.85),
  zIndex: 9,
  minWidth: 200,
  position: 'absolute',
  top: 8,
  right: 8,
  padding: 20,
  borderRadius: 4
}));

export default ControlPanelStyled;
