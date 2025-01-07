# Harvesting Assets

```
curl -X POST "https://us-central1-monitoring-agents.cloudfunctions.net/tx-relay/v1/txes/<network>" \
-H "Content-Type: application/json" \
-H "X-Auth-Token: <PUT AUTH TOKEN HERE>" \
-d '{
"to": "0x53144559C0d4a3304e2DD9dAfBD685247429216d",
"data": <encode harvestAssetsFromNotional([...])>
}'
```
