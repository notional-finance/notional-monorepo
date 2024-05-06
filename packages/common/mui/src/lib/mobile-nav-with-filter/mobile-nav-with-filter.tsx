import { useState } from 'react';
import { Box } from '@mui/material';
import { MarketsMobileNav, MobileFilterOptions } from './components';

interface MobileNavWithFilterProps {
  setEarnBorrowOption?: (v: number) => void;
  earnBorrowOption?: number;
  filterData: any[];
  options?: any[];
}

export const MobileNavWithFilter = ({
  setEarnBorrowOption,
  earnBorrowOption = 0,
  filterData,
  options,
}: MobileNavWithFilterProps) => {
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  return (
    <Box>
      <MarketsMobileNav
        options={options}
        setEarnBorrowOption={setEarnBorrowOption}
        earnBorrowOption={earnBorrowOption}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
      />
      <MobileFilterOptions
        filterData={filterData}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
      />
    </Box>
  );
};

export default MobileNavWithFilter;
