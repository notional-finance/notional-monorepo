export default {
  async fetch(request: Request) {
    // Simply echos back the cloudflare country information
    try {
      const { country } = (request as any).cf;
      return new Response(JSON.stringify({ country }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch {
      return new Response(JSON.stringify({ country: 'N/A' }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
