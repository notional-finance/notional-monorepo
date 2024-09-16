// material-ui
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

// project import
import MainCard from 'components/MainCard';
import data from 'data/movies';

// ==============================|| AUTOCOMPLETE - SIZES ||============================== //

export default function SizesAutocomplete() {
  return (
    <MainCard title="Sizes">
      <Stack spacing={2}>
        <Autocomplete
          id="size-small-outlined"
          size="small"
          options={data}
          getOptionLabel={(option) => option.label}
          defaultValue={data[13]}
          renderInput={(params) => <TextField {...params} placeholder="Size Small" />}
          sx={{
            '& .MuiOutlinedInput-root': {
              p: 1
            },
            '& .MuiAutocomplete-tag': {
              bgcolor: 'primary.lighter',
              border: '1px solid',
              borderColor: 'primary.light',
              '& .MuiSvgIcon-root': {
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark'
                }
              }
            }
          }}
        />
        <Autocomplete
          id="size-small-outlined"
          options={data}
          getOptionLabel={(option) => option.label}
          defaultValue={data[13]}
          // @ts-ignore
          renderOption={({ key, ...props }, option) => (
            <li key={key} {...props}>
              {option.label}
            </li>
          )}
          renderInput={(params) => <TextField {...params} placeholder="Size Small" />}
          sx={{
            '& .MuiOutlinedInput-root': {
              p: 1
            },
            '& .MuiAutocomplete-tag': {
              bgcolor: 'primary.lighter',
              border: '1px solid',
              borderColor: 'primary.light',
              '& .MuiSvgIcon-root': {
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark'
                }
              }
            }
          }}
        />
        <Autocomplete
          multiple
          id="size-small-outlined-multi"
          size="small"
          options={data}
          getOptionLabel={(option) => option.label}
          defaultValue={[data[13], data[3]]}
          // @ts-ignore
          renderOption={({ key, ...props }, option) => (
            <li key={key} {...props}>
              {option.label}
            </li>
          )}
          renderTags={(tagValue, getTagProps) => {
            return tagValue.map((option, index) => <Chip {...getTagProps({ index })} key={option.key} label={option.label} />);
          }}
          renderInput={(params) => <TextField {...params} placeholder="Size Small" />}
          sx={{
            '& .MuiOutlinedInput-root': {
              p: 1
            },
            '& .MuiAutocomplete-tag': {
              bgcolor: 'primary.lighter',
              border: '1px solid',
              borderColor: 'primary.light',
              '& .MuiSvgIcon-root': {
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark'
                }
              }
            }
          }}
        />
        <Autocomplete
          multiple
          id="size-default-outlined-multi"
          options={data}
          getOptionLabel={(option) => option.label}
          defaultValue={[data[13], data[3]]}
          // @ts-ignore
          renderOption={({ key, ...props }, option) => (
            <li key={key} {...props}>
              {option.label}
            </li>
          )}
          renderTags={(tagValue, getTagProps) => {
            return tagValue.map((option, index) => <Chip {...getTagProps({ index })} key={option.key} label={option.label} />);
          }}
          renderInput={(params) => <TextField {...params} placeholder="Size Medium" />}
          sx={{
            '& .MuiOutlinedInput-root': {
              p: 1
            },
            '& .MuiAutocomplete-tag': {
              bgcolor: 'primary.lighter',
              border: '1px solid',
              borderColor: 'primary.light',
              '& .MuiSvgIcon-root': {
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark'
                }
              }
            }
          }}
        />
        <Autocomplete
          multiple
          size="medium"
          id="size-large-outlined-multi"
          options={data}
          // @ts-ignore
          renderOption={({ key, ...props }, option) => (
            <li key={key} {...props}>
              {option.label}
            </li>
          )}
          renderTags={(tagValue, getTagProps) => {
            return tagValue.map((option, index) => <Chip {...getTagProps({ index })} key={option.key} label={option.label} />);
          }}
          getOptionLabel={(option) => option.label}
          defaultValue={[data[13], data[3]]}
          renderInput={(params) => <TextField {...params} placeholder="Size Large" />}
          sx={{
            '& .MuiOutlinedInput-root': {
              p: 1
            },
            '& .MuiAutocomplete-tag': {
              bgcolor: 'primary.lighter',
              border: '1px solid',
              borderColor: 'primary.light',
              '& .MuiSvgIcon-root': {
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark'
                }
              }
            }
          }}
        />
      </Stack>
    </MainCard>
  );
}
