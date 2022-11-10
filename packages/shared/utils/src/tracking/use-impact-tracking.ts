import { useEffect } from 'react';
import { getFromLocalStorage, setInLocalStorage } from '../helpers/storage-helpers';
import { updateTrackingState } from './tracking-store';

export const useImpactTracking = () => {
  // This is only executed once when the App loads
  useEffect(() => {
    // For impact.com tracking, see if there is an irclickid set in the url. We
    // cannot use the useQueryParams hook here because we are outside of the router
    const params = new URLSearchParams(window.location.search);
    const urlClickId = params.get('irclickid');
    const { clickId } = getFromLocalStorage('impact');
    if (urlClickId) {
      // We use last touch tracking so set a click id if we see it
      setInLocalStorage('impact', { clickId: urlClickId });
    }

    // Using last touch tracking, we override any set click id with the one in the url
    updateTrackingState({ impactClickId: urlClickId || clickId });
  }, []);
};
