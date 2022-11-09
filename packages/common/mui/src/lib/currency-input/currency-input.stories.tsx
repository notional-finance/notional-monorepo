import { Story, Meta } from '@storybook/react';
import { CurrencyInput, CurrencyInputProps } from './currency-input';

export default {
  component: CurrencyInput,
  title: 'CurrencyInput',
} as Meta;

const Template: Story<CurrencyInputProps> = (args) => <CurrencyInput {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  placeholder: 'placeholder',
  currencies: ['ETH', 'USDC', 'WBTC', 'DAI', 'cETH', 'NOTE'],
  decimals: 8,
  onInputChange: (v) => console.log(v),
};

export const WithMax = Template.bind({});
WithMax.args = {
  placeholder: 'placeholder',
  currencies: ['ETH', 'USDC', 'WBTC', 'DAI', 'cETH', 'NOTE'],
  decimals: 8,
  maxValue: '100.1234',
  onInputChange: (v) => console.log(v),
};

export const OneCurrency = Template.bind({});
OneCurrency.args = {
  placeholder: 'placeholder',
  currencies: ['NOTE'],
  decimals: 8,
  onInputChange: (v) => console.log(v),
};

export const WithWarning = Template.bind({});
WithWarning.args = {
  placeholder: 'placeholder',
  currencies: ['ETH', 'USDC', 'WBTC', 'DAI', 'cETH', 'NOTE'],
  decimals: 8,
  warningMsg: 'This is a warning',
  onInputChange: (v) => console.log(v),
};

export const WithError = Template.bind({});
WithError.args = {
  placeholder: 'placeholder',
  currencies: ['ETH', 'USDC', 'WBTC', 'DAI', 'cETH', 'NOTE'],
  decimals: 8,
  errorMsg: 'This is an error',
  // Errors will supercede warnings
  warningMsg: 'This is a warning',
  onInputChange: (v) => console.log(v),
};

export const WithCaption = Template.bind({});
WithError.args = {
  placeholder: 'placeholder',
  currencies: ['ETH', 'USDC', 'WBTC', 'DAI', 'cETH', 'NOTE'],
  decimals: 8,
  captionMsg: 'This is a caption',
  onInputChange: (v) => console.log(v),
};
