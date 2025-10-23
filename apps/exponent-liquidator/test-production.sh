#!/bin/bash

# Configuration
WRANGLER_URL="http://localhost:8787"

echo "🚀 Testing production endpoint on local wrangler server"
echo "URL: $WRANGLER_URL"
echo ""

echo "📡 Making request..."

# Make the curl request to the production endpoint (root path)
echo "Raw response:"
RESPONSE=$(curl -X GET "$WRANGLER_URL" \
  --silent --show-error --write-out "HTTPSTATUS:%{http_code}")

# Extract HTTP status code
HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | sed 's/HTTPSTATUS:[0-9]*$//')

echo "HTTP Status: $HTTP_CODE"
echo "Response Body: $RESPONSE_BODY"

# Try to parse as JSON if it looks like JSON
if [[ "$RESPONSE_BODY" == "{"* ]]; then
    echo ""
    echo "Formatted JSON:"
    echo "$RESPONSE_BODY" | jq .
else
    echo ""
    echo "Response is not JSON format"
fi

echo ""
echo "✅ Done!"