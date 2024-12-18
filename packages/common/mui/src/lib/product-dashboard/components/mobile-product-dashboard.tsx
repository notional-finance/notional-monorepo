import { Box, styled, useTheme } from '@mui/material';
import { DashboardGrid } from './dashboard-grid';
import { H3 } from '../../typography/typography';
import { useState } from 'react';
import Modal from '../../modal/modal';
import { InfoIcon } from '@notional-finance/icons';
import DashboardStateZero from './dashboard-state-zero';

interface MobileProductDashboardProps {
  gridData:
    | {
        data: any[];
        sectionTitle?: string;
        hasLeveragedPosition?: boolean;
        hasNegativePosition?: boolean;
      }[]
    | undefined;
  showNegativeYields?: boolean;
  setShowNegativeYields?: (showNegativeYields: boolean) => void;
  modalContent: any;
  mobileTitle: string;
  routeKey: string;
}

export const MobileProductDashboard = ({
  gridData,
  showNegativeYields,
  setShowNegativeYields,
  modalContent,
  mobileTitle,
  routeKey,
}: MobileProductDashboardProps) => {
  const theme = useTheme();
  const [activeModal, setActiveModal] = useState<number | null>(null);
  const isLoading = gridData && gridData?.length === 0 ? true : false;
  const noDataAvailable =
    gridData && gridData[0]?.data.length === 0 ? true : false;

  return (
    <>
      <Modal
        index={1}
        modalContent={modalContent}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
      />
      <MainContainer>
        <TitleContainer>
          <H3>{mobileTitle}</H3>
          <InfoButton onClick={() => setActiveModal(1)}>
            <InfoIcon
              fill={theme.palette.primary.light}
              style={{
                width: theme.spacing(2),
                height: theme.spacing(2),
              }}
            />
          </InfoButton>
        </TitleContainer>
        {noDataAvailable ? (
          <DashboardStateZero />
        ) : (
          <DashboardGrid
            gridData={gridData}
            isLoading={isLoading}
            showNegativeYields={showNegativeYields}
            setShowNegativeYields={setShowNegativeYields}
            threeWideGrid={false}
            routeKey={routeKey}
          />
        )}
      </MainContainer>
    </>
  );
};

const MainContainer = styled(Box)(
  ({ theme }) => `
    display: none;
    ${theme.breakpoints.down('sm')} {
      margin-top: ${theme.spacing(5)};
      display: block;
    }
      `
);

const TitleContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    padding: ${theme.spacing(2, 0)};
    justify-content: space-between;
    align-items: center;
      `
);

const InfoButton = styled(Box)(
  ({ theme }) => `
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: ${theme.shape.borderRadius()};
          padding: ${theme.spacing(1)};
          border: 1px solid ${theme.palette.primary.light};
          background: ${theme.palette.background.default};
        `
);

export default MobileProductDashboard;
