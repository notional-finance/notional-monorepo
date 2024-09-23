import { useState } from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';

// project import
import MainCard from 'components/MainCard';

// ==============================|| COMPONENTS - HELPER TEXT ||============================== //

export default function HelperTextSelect() {
  const [age, setAge] = useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };

  return (
    <MainCard title="With Helper Text">
      <Stack spacing={1}>
        <InputLabel id="demo-simple-select-helper-label">Number</InputLabel>
        <FormControl fullWidth>
          <Select labelId="demo-simple-select-helper-label" id="demo-simple-select-helper" value={age} onChange={handleChange}>
            <MenuItem value="">
              <em>Select Number</em>
            </MenuItem>
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
          <FormHelperText>helper text</FormHelperText>
        </FormControl>
      </Stack>
    </MainCard>
  );
}
