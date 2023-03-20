import { SectionLinkProps } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  DuneIcon,
  DashboardIcon,
  DefiLlamaIcon,
  TokenTerminalIcon,
} from '@notional-finance/icons';

export const useAnalyticsDropdown = () => {
  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Notional Dashboard'} />,
      to: 'https://info.notional.finance/',
      icon: (
        <DashboardIcon
          sx={{
            fontSize: '1.5rem',
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={`Use Notional's custom-built dashboard for full detail`}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Dune Dashboard'} />,
      to: 'https://dune.com/PierreYves_Gendron/Notional-V2-Dashboard',
      icon: (
        <DuneIcon
          sx={{
            fontSize: '1.5rem',
          }}
        />
      ),
      description: (
        <FormattedMessage defaultMessage={`Follow Notional's stats on Dune`} />
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
    {
      title: <FormattedMessage defaultMessage={'Token Terminal'} />,
      to: 'https://tokenterminal.com/terminal/projects/notional-finance',
      icon: (
        <TokenTerminalIcon
          sx={{
            fontSize: '1.5rem',
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage={`Analyze Notional's business and revenue metrics`}
        />
      ),
    },
  ];
  return { links };
};

export default useAnalyticsDropdown;
