import { useState } from 'react';

// material-ui
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// project import
import MainCard from 'components/MainCard';
import dataCreatable from 'data/movies';

interface FilmOptionType {
  inputValue?: string;
  label: string;
  year?: number;
}

const data: readonly FilmOptionType[] = dataCreatable;

const filter = createFilterOptions<FilmOptionType>();

// ==============================|| AUTOCOMPLETE - CREATABLE ||============================== //

export default function CreatableAutocomplete() {
  const [value, setValue] = useState<FilmOptionType | null>(null);

  return (
    <MainCard title="Creatable">
      <Autocomplete
        fullWidth
        value={value}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            setValue({
              label: newValue
            });
          } else if (newValue && newValue.inputValue) {
            setValue({
              label: newValue.inputValue
            });
          } else {
            setValue(newValue);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          const { inputValue } = params;

          const isExisting = options.some((option) => inputValue === option.label);
          if (inputValue !== '' && !isExisting) {
            filtered.push({
              inputValue,
              label: `Add "${inputValue}"`
            });
          }

          return filtered;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        id="free-solo-with-text-demo"
        options={data}
        getOptionLabel={(option) => {
          // value selected with enter, right from the input
          if (typeof option === 'string') {
            return option;
          }

          // add "xxx" option created dynamically
          if (option.inputValue) {
            return option.inputValue;
          }

          // regular option
          return option.label;
        }}
        // @ts-ignore
        renderOption={({ key, ...props }, option) => (
          <li key={key} {...props}>
            {option.label}
          </li>
        )}
        freeSolo
        renderInput={(params) => <TextField {...params} placeholder="Free solo with text demo" />}
      />
    </MainCard>
  );
}
