import { Story, Meta } from '@storybook/react';
import { MaturityCard, MaturityCardProps } from './maturity-card';

export default {
  component: MaturityCard,
  title: 'MaturityCard',
} as Meta;

const Template: Story<MaturityCardProps> = (args) => <MaturityCard {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  locale: 'en-US',
  selected: true,
  maturity: 1648512000,
  hasLiquidity: true,
  tradedRate: '0.763%',
  isFirstChild: false,
  isLastChild: false,
  onSelect: () => {
    console.log(true);
  },
};
