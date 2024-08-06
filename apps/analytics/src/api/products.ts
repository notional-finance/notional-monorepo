import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// project-import
import axios, { fetcher, fetcherPost } from 'utils/axios';

// types
import { Products, ProductsFilter, Reviews } from 'types/e-commerce';

export const endpoints = {
  key: 'api/products',
  list: '/list', // server URL
  filter: '/filter', // server URL
  related: 'api/product/related', // server URL
  review: 'api/review/list' // server URL
};

export function useGetProducts() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.list, fetcher, {
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });

  const memoizedValue = useMemo(
    () => ({
      products: data?.products as Products[],
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      productsEmpty: !isLoading && !data?.products?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function productFilter(filter: ProductsFilter) {
  const newProducts = await axios.post(endpoints.key + endpoints.filter, { filter });

  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentProducts: any) => {
      return {
        ...currentProducts,
        products: newProducts.data
      };
    },
    false
  );
}

export function useGetReleatedProducts(id: string) {
  const URL = [endpoints.related, { id, endpoints: 'products' }];

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcherPost, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      relatedProducts: data as Products[],
      relatedProductsLoading: isLoading,
      relatedProductsError: error,
      relatedProductsValidating: isValidating,
      relatedProductsEmpty: !isLoading && !data?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetProductReviews() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.review, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      productReviews: data?.productReviews as Reviews[],
      productReviewsLoading: isLoading,
      productReviewsError: error,
      productReviewsValidating: isValidating,
      productReviewsEmpty: !isLoading && !data?.productReviews.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
