import { Box } from '@mui/material';
import highRoller from './assets/high-roller.svg';
import fatCat from './assets/fat-cat.svg';
import sadSack from './assets/sad-sack.svg';

export const customIconCell = ({ cell }) => {
  const { row, value } = cell;
  if (!value) return null;
  const { text, dataSet } = value;

  const imgData = {
    fatCat,
    sadSack,
    highRoller,
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '18px' }}>
      {row.original.rank === '01' && (
        <img
          src={imgData[dataSet]}
          alt="icon"
          style={{ height: '18px', marginRight: '8px' }}
        />
      )}
      {text}
    </Box>
  );
};

export default customIconCell;
