import { graphql } from '../../gql';
export default graphql(`
  query DailyLendBorrowVolumes {
    dailyLendBorrowVolumes {
      id
      date
      tradeType
      marketIndex
      currency {
        id
        symbol
        underlyingSymbol
      }
      totalVolumeUnderlyingCash
    }
  }
`);
