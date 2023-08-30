import { Box } from '@mui/material';
import ace from './assets/ace.svg';
import fatCat from './assets/fat-cat.svg';
import sadSack from './assets/sad-sack.svg';

export const customIconCell = ({ cell }) => {
  const {
    row,
    value: { text, dataSet },
  } = cell;

  const imgData = {
    fatCat,
    sadSack,
    ace,
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
      {row.original.id === '01' && (
        <img
          src={imgData[dataSet]}
          alt="icon"
          style={{ height: '20px', marginRight: '8px' }}
        />
      )}
      {text}
    </Box>
  );
};

export default customIconCell;
