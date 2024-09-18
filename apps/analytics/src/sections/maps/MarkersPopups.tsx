import { useState, memo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import Map from 'react-map-gl';

// project-import
import MapControl from 'components/third-party/map/MapControl';
import MapMarker from 'components/third-party/map/MapMarker';
import MapPopup from 'components/third-party/map/MapPopup';

// types
import { MapBoxProps } from 'types/map';

type CountryProps = {
  name: string;
  capital: string;
  latlng: number[];
  timezones: string[];
  country_code: string;
};

interface Props extends MapBoxProps {
  data: CountryProps[];
}

// ==============================|| MAPBOX - MARKERS AND POPUP ||============================== //

function MarkersPopups({ data, ...other }: Props) {
  const [popupInfo, setPopupInfo] = useState<CountryProps | null>(null);

  return (
    <Map
      initialViewState={{
        latitude: 21.2335611,
        longitude: 72.8636084,
        zoom: 2
      }}
      {...other}
    >
      <MapControl />
      {data.map((city, index) => (
        <MapMarker
          key={`marker-${index}`}
          latitude={city.latlng[0]}
          longitude={city.latlng[1]}
          onClick={(event: any) => {
            event.originalEvent.stopPropagation();
            setPopupInfo(city);
          }}
        />
      ))}

      {popupInfo && (
        <MapPopup latitude={popupInfo.latlng[0]} longitude={popupInfo.latlng[1]} onClose={() => setPopupInfo(null)}>
          <Box
            sx={{
              mb: 1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box
              sx={{
                height: 18,
                minWidth: 28,
                mr: 1,
                borderRadius: 2,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundImage: `url(https://cdn.staticaly.com/gh/hjnilsson/country-flags/master/svg/${popupInfo.country_code.toLowerCase()}.svg)`
              }}
            />
            <Typography variant="subtitle2">{popupInfo.name}</Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography>Timezones:</Typography>
            <Typography variant="caption">{popupInfo.timezones}</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography>Lat:</Typography>
            <Typography variant="caption">{popupInfo.latlng[0]}</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography>Long</Typography>
            <Typography variant="caption">{popupInfo.latlng[1]}</Typography>
          </Stack>
        </MapPopup>
      )}
    </Map>
  );
}

export default memo(MarkersPopups);
