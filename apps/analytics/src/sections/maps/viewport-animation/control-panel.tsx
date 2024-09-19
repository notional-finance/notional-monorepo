import { memo } from 'react';

// material-ui
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

// project-import
import ControlPanelStyled from 'components/third-party/map/ControlPanelStyled';

// ==============================|| VIEWPORT ANIMATION - CONTROL ||============================== //

export type CityProps = {
  city: string;
  population: string;
  state: string;
  latitude: number;
  longitude: number;
};

type Props = {
  data: CityProps[];
  selectedCity: string;
  onSelectCity: (event: React.ChangeEvent<HTMLInputElement>, city: CityProps) => void;
};

function ControlPanel({ data, selectedCity, onSelectCity }: Props) {
  return (
    <ControlPanelStyled>
      {data.map((city) => (
        <RadioGroup key={city.city} value={selectedCity} onChange={(event) => onSelectCity(event, city)}>
          <FormControlLabel value={city.city} label={city.city} control={<Radio size="small" />} />
        </RadioGroup>
      ))}
    </ControlPanelStyled>
  );
}

export default memo(ControlPanel);
