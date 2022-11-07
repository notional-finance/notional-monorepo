import { useState, useEffect } from 'react';
import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (error && error instanceof Error) {
      setMessage(error.message);
    } else if (error && typeof error === 'string') {
      setMessage(error);
    } else if (error && Object.keys(error).includes('statusText')) {
      setMessage(error['statusText']);
    } else {
      setMessage('Unknown error');
    }
  }, [error]);

  useEffect(() => {
    if (message && message !== '') {
      console.error(message);
    }
  }, [message]);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{message}</i>
      </p>
    </div>
  );
}
