#!/bin/bash

# Configuration - Update these values as needed
FORK_URL="https://eth-mainnet.g.alchemy.com/v2/pq08EwFvymYFPbDReObtP-SFw3bCes8Z"
FORK_BLOCK_NUMBER="23670400"  # Update to your desired block
WRANGLER_URL="http://localhost:8787"
ANVIL_PORT="8545"

# Sample positions for testing - Update with real accounts/vaults
POSITIONS='[
  ["0x9299B176bFd1CaBB967ac2A027814FAad8782BA7", "0xAf14d06A65C91541a5b2db627eCd1c92d7d9C48B"],
  ["0xDF5A26554Ecb1a11614dbB34fC156D0adFc95C07", "0x7f723feE1E65A7d26bE51A05AF0B5eFEE4a7d5ae"]
]'

echo "🔗 Starting Anvil fork..."
echo "Fork URL: $FORK_URL"
echo "Fork Block: $FORK_BLOCK_NUMBER"
echo "Local Anvil Port: $ANVIL_PORT"

# Start anvil in the background
anvil --fork-url "$FORK_URL" --fork-block-number "$FORK_BLOCK_NUMBER" --port "$ANVIL_PORT" &
ANVIL_PID=$!

# Wait a bit for anvil to start
echo "⏳ Waiting for Anvil to start..."
sleep 3

# Check if anvil is running
if ! curl -s "http://localhost:$ANVIL_PORT" > /dev/null; then
    echo "❌ Anvil failed to start on port $ANVIL_PORT"
    exit 1
fi

echo "✅ Anvil fork is running on port $ANVIL_PORT"

# Test anvil fork with some basic RPC calls
echo "🧪 Testing anvil fork connectivity..."

# Test 1: Get chain ID
echo "📍 Testing chain ID..."
CHAIN_ID_RESPONSE=$(curl -s -X POST "http://localhost:$ANVIL_PORT" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}')
echo "Chain ID Response: $CHAIN_ID_RESPONSE"

# Test 2: Get current block number
echo "📦 Testing block number..."
BLOCK_NUMBER_RESPONSE=$(curl -s -X POST "http://localhost:$ANVIL_PORT" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":2}')
echo "Block Number Response: $BLOCK_NUMBER_RESPONSE"

# Test 3: Get network version
echo "🌐 Testing network version..."
NETWORK_RESPONSE=$(curl -s -X POST "http://localhost:$ANVIL_PORT" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"net_version","params":[],"id":3}')
echo "Network Response: $NETWORK_RESPONSE"

# Test 4: Try to call a contract (test one of your vault addresses)
echo "📋 Testing contract call..."
CONTRACT_RESPONSE=$(curl -s -X POST "http://localhost:$ANVIL_PORT" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_call",
    "params":[
      {
        "to":"0xAf14d06A65C91541a5b2db627eCd1c92d7d9C48B",
        "data":"0x481c6a75"
      },
      "latest"
    ],
    "id":4
  }')
echo "Contract Call Response: $CONTRACT_RESPONSE"

echo ""

# Prepare the test payload
TEST_PAYLOAD=$(cat <<EOF
{
  "positions": $POSITIONS,
  "forkUrl": "http://localhost:$ANVIL_PORT"
}
EOF
)

echo ""
echo "🚀 Sending test request to $WRANGLER_URL/test"
echo "Payload:"
echo "$TEST_PAYLOAD" | jq .

echo ""
echo "📡 Making request..."

# Make the curl request
echo "Raw response:"
RESPONSE=$(curl -X POST "$WRANGLER_URL/test" \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD" \
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

# Clean up - kill anvil
echo ""
echo "🧹 Cleaning up..."
kill $ANVIL_PID 2>/dev/null
echo "✅ Done!"