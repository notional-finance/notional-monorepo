yarn nx serve registry-exchanges --port 8890 --inspector-port 9999 --env dev &
yarn nx serve registry-tokens --port 8891 --inspector-port 9998 --env dev &
yarn node apps/localAPI.js
