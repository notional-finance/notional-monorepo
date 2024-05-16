import { useEffect, useState } from 'react';

export const useGovernanceData = () => {
  const [govData, setGovData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const query = `
        query {
          proposals (
            first: 3,
            skip: 0,
            where: {
              space_in: ["notional.eth"],
            },
            orderBy: "created",
            orderDirection: desc
          ) {
            id
            title
            body
            choices
            start
            end
            snapshot
            state
            scores
            scores_total
            author
            quorum
          }
        }
      `;

      try {
        const data = await fetch('https://hub.snapshot.org/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });
        const response = await data.json();
        setGovData(response.data.proposals);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, []);

  return govData;
};
