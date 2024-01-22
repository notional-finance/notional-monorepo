import { ProgressIndicator } from '@notional-finance/mui';
import { StepContainer } from '../contest-shared-elements/contest-shared-elements';

export const StepLoading = () => {
  return (
    <StepContainer>
      <ProgressIndicator type="notional" />
    </StepContainer>
  );
};

export default StepLoading;
