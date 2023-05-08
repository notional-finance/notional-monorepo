import { graphql } from '../../gql';
export default graphql(`
  query Accounts {
    accounts {
      id
      lastUpdateTimestamp
      hasCashDebt
      hasPortfolioAssetDebt
    }
  }
`);
