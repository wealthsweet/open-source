export type Protocol = "https" | "http";

export type URLParams = {
  host: string;
  path: string;
  params: URLSearchParams;
  protocol?: Protocol; // Will default to https
};

export function buildSrcProperty({
  protocol = "https",
  host,
  path,
  params,
}: URLParams) {
  return `${protocol}://${host}/${path}?${params.toString()}`;
}

export function serialiseURLSearchParams<
  TParams extends Record<string, string | string[]>,
>(params: TParams) {
  const urlParams = Object.entries(params)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.join(",")];
      } else {
        return [key, value];
      }
    })
    .filter(([_, value]) => value !== undefined);
  return new URLSearchParams(urlParams);
}
