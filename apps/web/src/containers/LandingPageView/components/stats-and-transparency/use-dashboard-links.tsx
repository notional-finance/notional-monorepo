import defiLlama from './images/defi-llama.svg';
import dune from './images/dune.svg';
import tokenTerminal from './images/token-terminal.svg';
import {
  DuneIcon,
  DefiLlamaIcon,
  TokenTerminalIcon,
} from '@notional-finance/icons';

export const useDashboardLinks = () => {
  return [
    {
      title: 'Dune Dashboard',
      link: 'https://dune.com/notional_team/notional-dashboard',
      image: dune,
      icon: (
        <DuneIcon
          sx={{
            fontSize: '1.5rem',
          }}
        />
      ),
    },
    {
      title: 'Defi Llama',
      link: 'https://defillama.com/protocol/notional',
      image: defiLlama,
      icon: (
        <DefiLlamaIcon
          sx={{
            fontSize: '1.5rem',
          }}
        />
      ),
    },
    {
      title: 'Token Terminal',
      link: 'https://tokenterminal.com/terminal/projects/notional-finance',
      image: tokenTerminal,
      icon: (
        <TokenTerminalIcon
          sx={{
            fontSize: '1.5rem',
          }}
        />
      ),
    },
  ];
};

export default useDashboardLinks;
