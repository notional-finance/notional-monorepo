import { Story, Meta } from '@storybook/react';
import { TokenIcon, TokenIconProps } from './token-icon';

export default {
  component: TokenIcon,
  title: 'TokenIcon',
} as Meta;

const Template: Story<TokenIconProps> = (args) => <TokenIcon {...args} />;

export const Default = Template.bind({});
Default.args = {
  symbol: 'note',
};
export const Unknown = Template.bind({});
Unknown.args = {
  symbol: 'notes',
};
export const WithSize = Template.bind({});
WithSize.args = {
  symbol: 'note',
  width: 24,
};
