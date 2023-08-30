import { FormattedMessage } from 'react-intl';

export const useContestRulesInfo = () => {
  const dataSetOne = [
    {
      text: (
        <FormattedMessage
          defaultMessage={`The yield competition will take place from [start time] to [end time].`}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`Eligibility for prizes is based on the participant’s realized APY (details below).`}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`Users can enter and exit at any time during the contest. Participants do not need to have deposits in Notional at the start time and can exit before the end time.`}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`Users can use any supported currency and instrument.`}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`Users can not deposit more than 1,000 USD. If the value of a user’s account grows while it’s on Notional and comes to exceed 1,000 USD, the user will not be disqualified. But users who push their account value over 1,000 USD by depositing will be disqualified.`}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`NOTE incentives are counted as earnings and will be converted to USD as of the average NOTE price over the course of the contest.`}
        />
      ),
    },
  ];
  const dataSetTwo = [
    {
      text: (
        <FormattedMessage
          defaultMessage={`Realized APY ignores the starting size of your account. $100 profit on $1,000 is the same realized APY as $1,000 profit on $10,000`}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`Realized APY rewards you for making money quickly. The realized APY for a user that makes $100 on $1,000 in one week is roughly twice as high as the user who makes $100 on $1,000 in two weeks.`}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`Realized APY can not be gamed or affected by making deposits or withdrawals. Users are free to deposit and withdraw in any currency as frequently as they want provided they stay under the $1,000 max account value.`}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`Exchange-rate fluctuations do not affect the realized APY - users will not be rewarded for going long ETH and the ETH price going up or penalized if the price goes down. Our realized APY calculation snaps all exchange rates at the start of the contest and holds them constant throughout the contest.`}
        />
      ),
    },
  ];
  return { dataSetOne, dataSetTwo };
};
