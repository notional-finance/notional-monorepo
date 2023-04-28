import { FormattedMessage } from 'react-intl';
import yearnLogo from '@notional-finance/assets/images/logos/logo-yearn.svg';
import hopLogo from '@notional-finance/assets/images/logos/logo-hop.svg';
import indexCoop from '@notional-finance/assets/images/logos/logo-index-coop.svg';

export const useUserCards = () => {
  const userData = [
    {
      name: 'J Monteer',
      title: 'Strategist | Yearn Finance',
      twitterLink: 'https://twitter.com/jmonteer23',
      logo: yearnLogo,
      text: (
        <FormattedMessage
          defaultMessage={
            'Notional is pioneering an important product category and they are a consistent, reliable, and attractive source of yield for our vaults at Yearn'
          }
        />
      ),
    },
    {
      name: 'c-squared.eth',
      title: 'Automated Products | Index Coop',
      twitterLink: 'https://twitter.com/csquared_eth',
      logo: hopLogo,
      text: (
        <FormattedMessage
          defaultMessage={`Notional continues to offer one of the best UXs in DeFi at the dapp and protocol layers, and its implementation of fixed rates on-chain has tremendous potential. Notional's commitment to composability also positions the protocol to be the backbone for countless structured products in the future!`}
        />
      ),
    },
    {
      name: 'Lito Coen',
      title: 'Growth | Hop Protocol',
      twitterLink: 'https://twitter.com/litocoen',
      logo: indexCoop,
      text: (
        <FormattedMessage
          defaultMessage={`Notional has projected the lending space into a new era with its fixed rates. Being able to lock in my borrowing costs for several months at a time, gives me a lot of peace of mind when assessing my next investment opportunity. Leveraged vaults make this easily accessible for everyone.`}
        />
      ),
    },
  ];
  return userData;
};

export default useUserCards;
