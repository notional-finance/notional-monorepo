import React from 'react';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { getGeocode } from 'use-places-autocomplete';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';

// project import
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';

function loadScript(src: string, position: HTMLElement | null, id: string) {
  if (!position) {
    return;
  }

  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.setAttribute('id', id);
  script.src = src;
  position.appendChild(script);
}

const autocompleteService = { current: null };

interface MainTextMatchedSubstrings {
  offset: number;
  length: number;
}
interface StructuredFormatting {
  main_text: string;
  secondary_text: string;
  main_text_matched_substrings: readonly MainTextMatchedSubstrings[];
}
interface PlaceType {
  description: string;
  structured_formatting: StructuredFormatting;
}

// ==============================|| GOOGLE MAP - AUTOCOMPLETE ||============================== //

export default function GoogleMaps({ formik, disabled }: any) {
  const [value, setValue] = React.useState<PlaceType | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<readonly PlaceType[]>([]);
  const loaded = React.useRef(false);

  if (typeof window !== 'undefined' && !loaded.current) {
    if (!document.querySelector('#google-maps')) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`,
        document.querySelector('head'),
        'google-maps'
      );
    }

    loaded.current = true;
  }

  const fetch = React.useMemo(
    () =>
      throttle((request: { input: string }, callback: (results?: readonly PlaceType[]) => void) => {
        (autocompleteService.current as any).getPlacePredictions({ ...request, componentRestrictions: { country: 'uk' } }, callback);
      }, 200),
    []
  );

  React.useEffect(() => {
    let active = true;

    if (!autocompleteService.current && (window as any).google) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results?: readonly PlaceType[]) => {
      if (active) {
        let newOptions: readonly PlaceType[] = [];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  return (
    <Autocomplete
      id="google-map-demo"
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
      filterOptions={(x) => x}
      options={options}
      autoComplete
      fullWidth
      autoHighlight
      includeInputInList
      filterSelectedOptions
      disabled={disabled}
      value={value}
      onChange={(event: any, newValue: PlaceType | null) => {
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
        let address1: string = '';
        getGeocode({ address: newValue?.description })
          .then((results: any) => {
            results[0].address_components.filter((locData: any) => {
              if (locData.types[0] === 'route') {
                if (locData.long_name !== undefined) address1 = address1 !== '' ? `${locData.long_name} ${address1}` : locData.long_name;
              }

              if (locData.types[0] === 'street_number') {
                if (locData.long_name !== undefined) address1 = address1 !== '' ? `${address1} ${locData.long_name}` : locData.long_name;
              }

              if (locData.types[0] === 'locality' || locData.types[0] === 'postal_town') {
                locData.long_name !== undefined && formik.setFieldValue('city', locData.long_name);
                formik.setFieldTouched('city', false, false);
              }

              if (locData.types[0] === 'administrative_area_level_1') {
                locData.long_name !== undefined && formik.setFieldValue('county', locData.long_name);
                formik.setFieldTouched('county', false, false);
              }

              if (locData.types[0] === 'country') {
                formik.setFieldValue('country', locData.long_name);
                formik.setFieldTouched('country', false, false);
              }
              if (locData.types[0] === 'postal_code') {
                locData.long_name !== undefined && formik.setFieldValue('postCode', locData.long_name);
                formik.setFieldTouched('postCode', false, false);
              }
              return false;
            });
          })
          .then(() => {
            formik.setFieldValue('address1', address1);
            formik.setFieldTouched('address1', false, false);
          });
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => <TextField {...params} placeholder="Search your company address" fullWidth />}
      // @ts-ignore
      renderOption={({ key, ...props }, option) => {
        const matches = option.structured_formatting.main_text_matched_substrings;
        const parts = parse(
          option.structured_formatting.main_text,
          matches.map((match: any) => [match.offset, match.offset + match.length])
        );

        return (
          <li key={key} {...props}>
            <Grid container alignItems="center">
              <Grid item>
                <Box component={EnvironmentOutlined} sx={{ color: 'text.secondary', mr: 2 }} />
              </Grid>
              <Grid item xs>
                {parts.map((part: any, index: number) => (
                  <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                    {part.text}
                  </span>
                ))}
                <Typography variant="body2" color="text.secondary">
                  {option.structured_formatting.secondary_text}
                </Typography>
              </Grid>
            </Grid>
          </li>
        );
      }}
    />
  );
}
