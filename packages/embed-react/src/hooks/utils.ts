export function buildContextParamsNotFoundError(
  hookName: string,
  requiredParams: string[],
) {
  return new Error(
    `WealthSweetContext not found and ${requiredParams.length > 1 ? `one of (${requiredParams.join(",")}) parameters` : `${requiredParams[0]} parameter`} was not found.\n
    The ${hookName} hook needs these variables to be provided as parameters or to be provided in the WealthSweetContext.`,
  );
}

export function chooseHookParamElseContextParam<TParam>(
  hookParam: TParam | undefined,
  contextParam: TParam | undefined,
  contextLoaded: boolean,
  error: Error,
) {
  if (hookParam) {
    return hookParam;
  } else if (contextLoaded && contextParam) {
    return contextParam;
  } else {
    console.error(
      `
      Choosing hook and token param failed.\n
        hookParam: ${hookParam}\n
        contextParam: ${contextParam}\n
        contextLoaded: ${contextLoaded}\n
        error: ${error}
      `,
      error,
    );
    throw error;
  }
}
