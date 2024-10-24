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
  TParams extends Record<string, string | string[] | null | undefined>,
>(params: TParams) {
  const validParams: [string, string][] = [];
  for (const [key, value] of Object.entries(params)) {
    // If the value is '' , undefined or null then remove it from the params.
    if (value === "" || value === undefined || value == null) {
      continue;
    }
    if (Array.isArray(value)) {
      validParams.push([key, value.join(",")]);
    } else {
      validParams.push([key, value]);
    }
  }
  return new URLSearchParams(Object.fromEntries(validParams));
}
