export function trimRouterMatchToPath(matchParam: string) {
  // React router matches may include query params and fragments, this will trim
  // off anything trailing to get just the path match
  const [match] = matchParam.split('?');
  return match.split('#')[0];
}

export function getQueryParams() {
  const queryParams = new URLSearchParams(window.location.search);
  const cleanedQueryParams: Record<string, string> = {};
  queryParams.forEach((v, k) => {
    cleanedQueryParams[k] = v;
  });

  return cleanedQueryParams;
}
