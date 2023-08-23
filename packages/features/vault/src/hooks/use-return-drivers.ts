import { BorderCell } from '@notional-finance/mui';
import { useIntl } from 'react-intl';
import { messages } from '../messages';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { Registry } from '@notional-finance/core-entities';
import { SECONDS_IN_DAY, getNowSeconds } from '@notional-finance/util';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useReturnDrivers = (vaultAddress: string | undefined) => {
  const intl = useIntl();
  const network = useSelectedNetwork();
  const data =
    network && vaultAddress
      ? Registry.getAnalyticsRegistry().getVault(network, vaultAddress)
      : undefined;

  const tableColumns = [
    {
      Header: intl.formatMessage(messages.summary.returnsDriversSource),
      accessor: 'source',
      textAlign: 'left',
      Cell: BorderCell,
      padding: '0px',
    },
    {
      Header: intl.formatMessage(messages.summary.returnsDrivers7dayAverage),
      accessor: 'shortAvg',
      textAlign: 'right',
      Cell: BorderCell,
      padding: '0px',
    },
    {
      Header: intl.formatMessage(messages.summary.returnsDrivers30dayAverage),
      accessor: 'longAvg',
      textAlign: 'right',
      Cell: BorderCell,
      padding: '0px',
    },
  ];

  const returnDrivers =
    data && data.length > 0
      ? Object.keys(data[0].returnDrivers)
          .map((k) => {
            const shortValues = data
              .filter((d) => d.timestamp > getNowSeconds() - 7 * SECONDS_IN_DAY)
              .map(({ returnDrivers }) => returnDrivers[k])
              .filter((v) => v !== null) as number[];

            const longValues = data
              .filter(
                (d) => d.timestamp > getNowSeconds() - 30 * SECONDS_IN_DAY
              )
              .map(({ returnDrivers }) => returnDrivers[k])
              .filter((v) => v !== null) as number[];

            return {
              source: k
                // TODO: remove all this stuff once the variables are fixed
                .replace(/_/g, ' ')
                .replace(
                  /\w\S*/g,
                  (txt) =>
                    txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
                )
                .replace(/apy/i, 'APY'),
              shortAvg:
                shortValues.length > 0
                  ? formatNumberAsPercent(
                      shortValues.reduce((s, v) => s + v, 0) /
                        shortValues.length
                    )
                  : undefined,
              longAvg:
                longValues.length > 0
                  ? formatNumberAsPercent(
                      longValues.reduce((s, v) => s + v, 0) / longValues.length
                    )
                  : undefined,
            };
          })
          .filter(
            ({ shortAvg, longAvg }) =>
              shortAvg !== undefined || longAvg !== undefined
          )
          // Ensure the total strategy apy is at the end
          .sort((a) => (a.source === 'Total Strategy APY' ? -1 : 0))
          .reverse()
      : [];

  return { tableColumns, returnDrivers };
};
