export function buildContextParamsNotFoundError(
  hookName: string,
  requiredParams: string[],
) {
  return new Error(
    `WealthSweetContext not found and ${requiredParams.length > 1 ? `one of (${requiredParams.join(",")}) parameters` : `${requiredParams[0]} parameter`} was not found.\n
    The ${hookName} hook needs these variables to be provided as parameters or to be provided in the WealthSweetContext.`,
  );
}
