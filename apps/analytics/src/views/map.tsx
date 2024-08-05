'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

// project-import
import MainCard from 'components/MainCard';
import MapContainerStyled from 'components/third-party/map/MapContainerStyled';

import ClustersMap from 'sections/maps/clusters-map';
import ChangeTheme from 'sections/maps/change-theme';
import DraggableMarker from 'sections/maps/draggable-marker';
import GeoJSONAnimation from 'sections/maps/GeoJSONAnimation';
import Heatmap from 'sections/maps/heatmap';
import HighlightByFilter from 'sections/maps/HighlightByFilter';
import InteractionMap from 'sections/maps/interaction-map';
import MarkersPopups from 'sections/maps/MarkersPopups';
import SideBySide from 'sections/maps/side-by-side';
import ViewportAnimation from 'sections/maps/viewport-animation';

import { ThemeMode } from 'config';
import { cities, countries } from 'data/location';

const MAPBOX_THEMES = {
  light: 'mapbox://styles/mapbox/light-v10',
  dark: 'mapbox://styles/mapbox/dark-v10',
  streets: 'mapbox://styles/mapbox/streets-v11',
  outdoors: 'mapbox://styles/mapbox/outdoors-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v11'
};

const mapConfiguration = {
  mapboxAccessToken: process.env.NEXT_APP_MAPBOX_ACCESS_TOKEN,
  minZoom: 1
};

// ==============================|| MAP ||============================== //

export default function Map() {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="Theme Variants">
          <MapContainerStyled>
            <ChangeTheme {...mapConfiguration} themes={MAPBOX_THEMES} />
          </MapContainerStyled>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <MainCard title="Markers & Popups">
          <MapContainerStyled>
            <MarkersPopups
              {...mapConfiguration}
              data={countries}
              mapStyle={theme.palette.mode === ThemeMode.DARK ? MAPBOX_THEMES.dark : MAPBOX_THEMES.light}
            />
          </MapContainerStyled>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <MainCard title="Draggable Marker">
          <MapContainerStyled>
            <DraggableMarker
              {...mapConfiguration}
              mapStyle={theme.palette.mode === ThemeMode.DARK ? MAPBOX_THEMES.dark : MAPBOX_THEMES.light}
            />
          </MapContainerStyled>
        </MainCard>
      </Grid>
      <Grid item xs={12}>
        <MainCard title="Geo JSON Animation">
          <MapContainerStyled>
            <GeoJSONAnimation {...mapConfiguration} mapStyle={MAPBOX_THEMES.satelliteStreets} />
          </MapContainerStyled>
        </MainCard>
      </Grid>
      <Grid item xs={12}>
        <MainCard title="Clusters">
          <MapContainerStyled>
            <ClustersMap
              {...mapConfiguration}
              mapStyle={theme.palette.mode === ThemeMode.DARK ? MAPBOX_THEMES.dark : MAPBOX_THEMES.light}
            />
          </MapContainerStyled>
        </MainCard>
      </Grid>
      <Grid item xs={12}>
        <MainCard title="Interaction">
          <MapContainerStyled>
            <InteractionMap
              {...mapConfiguration}
              mapStyle={theme.palette.mode === ThemeMode.DARK ? MAPBOX_THEMES.dark : MAPBOX_THEMES.light}
            />
          </MapContainerStyled>
        </MainCard>
      </Grid>
      <Grid item xs={12}>
        <MainCard title="Viewport Animation">
          <MapContainerStyled>
            <ViewportAnimation
              {...mapConfiguration}
              data={cities.filter((city) => city.state === 'Gujarat')}
              mapStyle={MAPBOX_THEMES.outdoors}
            />
          </MapContainerStyled>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <MainCard title="Highlight By Filter">
          <MapContainerStyled>
            <HighlightByFilter
              {...mapConfiguration}
              mapStyle={theme.palette.mode === ThemeMode.DARK ? MAPBOX_THEMES.dark : MAPBOX_THEMES.light}
            />
          </MapContainerStyled>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <MainCard title="Heatmap">
          <MapContainerStyled>
            <Heatmap {...mapConfiguration} mapStyle={theme.palette.mode === ThemeMode.DARK ? MAPBOX_THEMES.dark : MAPBOX_THEMES.light} />
          </MapContainerStyled>
        </MainCard>
      </Grid>
      <Grid item xs={12}>
        <MainCard title="Side By Side">
          <MapContainerStyled>
            <SideBySide {...mapConfiguration} />
          </MapContainerStyled>
        </MainCard>
      </Grid>
    </Grid>
  );
}
