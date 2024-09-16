# rewards bot

Used to claim and reinvest rewards on vaults

## Force claim or reinvest

check http.rest for interactive examples

curl -H "x-auth-key: $AUTH_KEY" "https://rewards-dev.notional-finance.workers.dev?network=<network>&vaultAddress=<address>&action=<claim|reinvest>&force=true"
