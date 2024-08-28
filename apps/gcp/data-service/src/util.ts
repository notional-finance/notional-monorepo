export async function logToDataDog(service: string, message: any, ddtags = '') {
  return fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'DD-API-KEY': process.env.DD_API_KEY as string,
    },
    body: JSON.stringify({
      ddsource: service,
      ddtags,
      service,
      message,
    }),
  }).catch((err) => console.error(err));
}
