// project import
import SimpleBar from 'components/third-party/SimpleBar';
import Navigation from './Navigation';

// ==============================|| DRWAER CONTENT ||============================== //

export default function DrawerContent({ searchValue }: { searchValue?: string }) {
  return (
    <SimpleBar
      sx={{
        height: { xs: 'calc(100vh - 70px)', md: 'calc(100% - 70px)' },
        '& .simplebar-content': {
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Navigation searchValue={searchValue} />
    </SimpleBar>
  );
}
