import { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { Caption } from '../../typography/typography';
import highRoller from './assets/high-roller.svg';
import fatCat from './assets/fat-cat.svg';
import sadSack from './assets/sad-sack.svg';
import { FormattedMessage } from 'react-intl';

export const CustomIconCell = ({ cell }) => {
  const theme = useTheme();
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
      <Caption
        sx={{
          background: theme.palette.background.paper,
          color: theme.palette.typography.main,
          padding: theme.spacing(1.5),
          position: 'absolute',
          borderRadius: theme.shape.borderRadius(),
          border: `1px solid ${theme.palette.primary.light}`,
          marginTop: theme.spacing(12),
          transition: 'all 0.3s ease-in-out',
          opacity: showAlert ? 1 : 0,
        }}
      >
        <FormattedMessage defaultMessage="Address Copied" />
      </Caption>
    </Box>
  );
};

export default CustomIconCell;
