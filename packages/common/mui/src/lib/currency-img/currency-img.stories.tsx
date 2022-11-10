import { Story, Meta } from '@storybook/react';
import { CurrencyImg, CurrencyImgProps } from './currency-img';

export default {
  component: CurrencyImg,
  title: 'CurrencyImg',
} as Meta;

const Template: Story<CurrencyImgProps> = (args) => <CurrencyImg {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  symbol: 'note',
  enabled: true,
};
