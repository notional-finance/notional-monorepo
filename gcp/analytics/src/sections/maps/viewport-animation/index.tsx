import { useRef, useState, useCallback, memo } from 'react';

// third-party
import Map, { MapRef } from 'react-map-gl';

// project-import
import ControlPanel, { CityProps } from './control-panel';
import MapControl from 'components/third-party/map/MapControl';

// types
import { MapBoxProps } from 'types/map';

// ==============================|| MAP - VIEWPORT ANIMATION ||============================== //

interface Props extends MapBoxProps {
  data: CityProps[];
}

function ViewportAnimation({ data, ...other }: Props) {
  const mapRef = useRef<MapRef>(null);

  const [selectedCity, setSelectedCity] = useState(data[2].city);

  const onSelectCity = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, { longitude, latitude }: { longitude: number; latitude: number }) => {
      setSelectedCity(event.target.value);
      mapRef.current?.flyTo({ center: [longitude, latitude], duration: 2000 });
    },
    []
  );

  return (
    <Map
      initialViewState={{
        latitude: 22.299405,
        longitude: 73.208119,
        zoom: 11,
        bearing: 0,
        pitch: 0
      }}
      ref={mapRef}
      {...other}
    >
      <MapControl />
      <ControlPanel data={data} selectedCity={selectedCity} onSelectCity={onSelectCity} />
    </Map>
  );
}

export default memo(ViewportAnimation);
