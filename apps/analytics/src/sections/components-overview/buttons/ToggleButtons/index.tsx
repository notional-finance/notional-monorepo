// material-ui
import Stack from '@mui/material/Stack';

// project import
import MainCard from 'components/MainCard';
import ExclusiveToggleButtons from './ExclusiveToggleButtons';
import MultipleToggleButtons from './MultipleToggleButtons';
import ColorToggleButton from './ColorToggleButton';
import TextToggleButtons from './TextToggleButtons';
import VariantToggleButtons from './VariantToggleButtons';
import VerticalToggleButtons from './VerticalToggleButtons';

// ==============================|| TOGGLE BUTTON ||============================== //

export default function ToggleButtons() {
  return (
    <MainCard title="Toggle Button">
      <Stack spacing={2} sx={{ mb: 2 }}>
        <ExclusiveToggleButtons />
        <MultipleToggleButtons />
        <ColorToggleButton />
        <TextToggleButtons />
        <VariantToggleButtons />
      </Stack>
      <VerticalToggleButtons />
    </MainCard>
  );
}
