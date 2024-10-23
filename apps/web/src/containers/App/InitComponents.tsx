import {
  useSanctionsBlock,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { usePageTrack } from '@notional-finance/helpers';
import { Intercom, shutdown } from '@intercom/messenger-js-sdk';
import { RouteType } from '@notional-finance/util';
import { useEffect } from 'react';

export const InitSanctionsBlock = () => {
  useSanctionsBlock();
  return <div></div>;
};

export const InitIntercom = () => {
  const intercomID = process.env['NX_INTERCOM_APP_ID'] as string;
  useEffect(() => {
    Intercom({
      app_id: intercomID,
    });

    return () => {
      shutdown();
    };
  }, []);
  return <div></div>;
};

export const InitPageTrack = ({ routeType }: { routeType: RouteType }) => {
  const selectedNetwork = useWalletConnectedNetwork();
  usePageTrack(routeType, selectedNetwork);
  return <div></div>;
};
