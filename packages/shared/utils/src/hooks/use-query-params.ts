import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useQueryParams = () => {
  const { search } = useLocation();
  const [queryParams, setQueryParams] = useState<URLSearchParams>();
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    setQueryParams(new URLSearchParams(search));
  }, [search, setQueryParams]);

  useEffect(() => {
    const updateQueryParams = () => {
      const cleanedQueryParams = {};
      queryParams?.forEach((v, k) => {
        cleanedQueryParams[k] = v;
      });
      setParams(cleanedQueryParams);
    };
    updateQueryParams();
  }, [queryParams]);
  return params;
};
