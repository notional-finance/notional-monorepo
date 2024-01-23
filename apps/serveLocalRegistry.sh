# yarn nx serve registry --port 8888 &
# yarn nx serve registry-exchange --port 8889 &
yarn nx serve data --env dev --port 8890 &
yarn node apps/localAPI.js
