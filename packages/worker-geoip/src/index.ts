export default {
  async fetch(request: Request) {
    // Simply echos back the cloudflare country information
    try {
      const { country } = (request as any).cf;
      return new Response(JSON.stringify({ country }));
    } catch {
      return new Response(JSON.stringify({ country: 'N/A' }));
    }
  },
};
