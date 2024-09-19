import { useState, useCallback, memo } from 'react';

// third-party
import Map from 'react-map-gl';

// project-imports
import ControlPanel from './control-panel';
import MapControl from 'components/third-party/map/MapControl';

// types
import { MapBoxProps } from 'types/map';

interface Props extends MapBoxProps {
  themes: {
    [key: string]: string;
  };
  projection: undefined;
}

// ==============================|| MAPBOX - THEME ||============================== //

function ChangeTheme({ themes, ...other }: Props) {
  const [selectTheme, setSelectTheme] = useState('streets');
  const handleChangeTheme = useCallback((value: string) => setSelectTheme(value), []);

  return (
    <>
      <Map
        initialViewState={{
          latitude: 21.2335611,
          longitude: 72.8636084,
          zoom: 6,
          bearing: 0,
          pitch: 0
        }}
        mapStyle={themes?.[selectTheme]}
        {...other}
      >
        <MapControl />
      </Map>

      <ControlPanel themes={themes} selectTheme={selectTheme} onChangeTheme={handleChangeTheme} />
    </>
  );
}

export default memo(ChangeTheme);
