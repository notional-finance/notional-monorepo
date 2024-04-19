import { useState } from 'react';

export const useNetworkToggle = () => {
  const [networkToggleOption, setNetworkToggleOption] = useState(0);

  return {
    toggleKey: networkToggleOption,
    setToggleKey: setNetworkToggleOption,
  };
};

export default useNetworkToggle;
