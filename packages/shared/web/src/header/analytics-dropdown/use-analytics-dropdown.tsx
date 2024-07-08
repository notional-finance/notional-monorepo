import { SectionLinkProps } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { DuneIcon, DefiLlamaIcon } from '@notional-finance/icons';

export const useAnalyticsDropdown = () => {
  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Dune Dashboard - Mainnet'} />,
      to: 'https://dune.com/PierreYves_Gendron/notional-dashboard',
      icon: (
        <DuneIcon
          sx={{
            fontSize: '1.5rem',
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={`Follow the stats from Notional's Mainnet deployment`}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Dune Dashboard - Arbitrum'} />,
      to: 'https://dune.com/PierreYves_Gendron/notional-finance-v3-arbitrum',
      icon: (
        <DuneIcon
          sx={{
            fontSize: '1.5rem',
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={`Follow the stats from Notional's Arbitrum deployment`}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Defi Llama'} />,
      to: 'https://defillama.com/protocol/notional',
      icon: (
        <DefiLlamaIcon
          sx={{
            fontSize: '1.5rem',
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={
            'Find a Notional overview and current yields on DeFi Llama'
          }
        />
      ),
    },
  ];
  return { links };
};

export default useAnalyticsDropdown;
