export const logToDataDog =
  (source: string) =>
  async (
    message: Record<string, unknown>,
    { tags = '', service = 'signer' } = {}
  ) => {
    return fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'DD-API-KEY': process.env.DD_API_KEY as string,
      },
      body: JSON.stringify({
        ddsource: source,
        ddtags: tags,
        service,
        message,
      }),
    }).catch((err) => console.error(err));
  };
