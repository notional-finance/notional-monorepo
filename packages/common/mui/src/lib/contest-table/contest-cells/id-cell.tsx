import { Box } from '@mui/material';

export const idCell = ({ cell }) => {
  const { getValue } = cell;
  const value = getValue();
  return <Box sx={{ fontSize: '32px', fontFamily: 'Kunst' }}>{value}</Box>;
};

export default idCell;
