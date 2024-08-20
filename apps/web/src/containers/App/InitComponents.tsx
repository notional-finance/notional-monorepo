import {
  useSanctionsBlock,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { usePageTrack } from '@notional-finance/helpers';
import { useIntercom } from 'react-use-intercom';
import { RouteType } from '@notional-finance/util';

export const InitSanctionsBlock = () => {
  useSanctionsBlock();
  return <div></div>;
};

export const InitIntercom = () => {
  const { boot } = useIntercom();
  boot();
  return <div></div>;
};

export const InitPageTrack = ({ routeType }: { routeType: RouteType }) => {
  const selectedNetwork = useWalletConnectedNetwork();
  usePageTrack(routeType, selectedNetwork);
  return <div></div>;
};
