import { Story, Meta } from '@storybook/react';
import { TokenApproval, TokenApprovalProps } from './token-approval';

export default {
  component: TokenApproval,
  title: 'TokenApproval',
} as Meta;

const Template: Story<TokenApprovalProps> = (args) => <TokenApproval {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  symbol: 'note',
  onChange: ({ symbol, approved }) => console.log(`${symbol}: ${approved}`),
};
