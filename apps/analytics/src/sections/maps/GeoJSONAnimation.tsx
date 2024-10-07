import { useState, useEffect, memo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import Map, { Layer, LayerProps, Source } from 'react-map-gl';

// project-import
import MapControl from 'components/third-party/map/MapControl';

// types
import { MapBoxProps } from 'types/map';

// ==============================|| GEO JSON ANIMATION ||============================== //

function GeoJSONAnimation({ ...other }: MapBoxProps) {
  const theme = useTheme();

  const pointLayer: LayerProps = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': theme.palette.error.main
    }
  };

  const [pointData, setPointData] = useState<
    | {
        type: string;
        coordinates: number[];
      }
    | any
  >(null);

  useEffect(() => {
    const animation = window.requestAnimationFrame(() =>
      setPointData(
        pointOnCircle({
          center: [72.8636084, 21.2335611],
          angle: Date.now() / 1000,
          radius: 2
        })
      )
    );

    return () => window.cancelAnimationFrame(animation);
  });

  return (
    <Map
      initialViewState={{
        latitude: 21.2335611,
        longitude: 72.8636084,
        zoom: 6
      }}
      mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
      {...other}
    >
      <MapControl />
      {pointData && (
        <Source type="geojson" data={pointData}>
          <Layer {...pointLayer} />
        </Source>
      )}
    </Map>
  );
}

export default memo(GeoJSONAnimation);

function pointOnCircle({ center, angle, radius }: { center: [number, number]; angle: number; radius: number }) {
  return {
    type: 'Point',
    coordinates: [center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius]
  };
}
