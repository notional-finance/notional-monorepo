import { graphql } from './gql';
export default graphql(`
  query Currencies {
    currencies {
      id
      tokenAddress
      tokenType
      decimals
      name
      symbol
    }
  }
`);
