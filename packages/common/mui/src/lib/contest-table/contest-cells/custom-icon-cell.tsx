import { useState } from 'react';
import { Box } from '@mui/material';
import { CopyCaption } from '../../copy-caption/copy-caption';
import highRoller from './assets/high-roller.svg';
import fatCat from './assets/fat-cat.svg';
import sadSack from './assets/sad-sack.svg';

export const CustomIconCell = ({ cell }) => {
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { row, value } = cell;
  if (!value) return null;
  const { text, dataSet, fullAddress } = value;

  const imgData = {
    fatCat,
    sadSack,
    highRoller,
  };

  if (showAlert) {
    setTimeout(() => {
      setShowAlert(false);
    }, 1000);
  }

  const handleCopy = () => {
    if (fullAddress) {
      navigator.clipboard.writeText(fullAddress);
      setShowAlert(true);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '18px',
        cursor: 'pointer',
      }}
      onClick={handleCopy}
    >
      {row.original.rank === '01' && (
        <img
          src={imgData[dataSet]}
          alt="icon"
          style={{ height: '18px', marginRight: '8px' }}
        />
      )}
      {text}
      <CopyCaption showAlert={showAlert} />
    </Box>
  );
};

export default CustomIconCell;
