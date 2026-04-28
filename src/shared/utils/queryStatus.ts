import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

type QueryStatus = {
  isLoading: boolean;
  isFetching: boolean;
  isPending: boolean;
  hasError: boolean;
  isEmpty: boolean;
  isAnyLoading: boolean;
};

const isQueryResult = (
  value: unknown
): value is UseQueryResult<unknown, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    ("isLoading" in value || "isFetching" in value)
  );
};

const isMutationResult = (
  value: unknown
): value is UseMutationResult<unknown, unknown, unknown, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    "isPending" in value &&
    "mutate" in value
  );
};

const isEmptyData = (data: unknown): boolean => {
  if (data === null || data === undefined) {
    return true;
  }

  if (Array.isArray(data)) {
    return data.length === 0;
  }

  if (typeof data === "object") {
    return Object.keys(data).length === 0;
  }

  return false;
};

export const isQueryLoading = <TData, TError>(
  queryResult: UseQueryResult<TData, TError>
): boolean => {
  return queryResult.isLoading === true;
};

export const isQueryError = <TData, TError>(
  queryResult: UseQueryResult<TData, TError>
): boolean => {
  return queryResult.error !== null && queryResult.error !== undefined;
};

export const isQueryEmpty = <TData, TError>(
  queryResult: UseQueryResult<TData, TError>
): boolean => {
  if (isQueryError(queryResult)) {
    return false;
  }

  return isEmptyData(queryResult.data);
};

export const isMutationPending = <TData, TError, TVariables, TContext>(
  mutationResult: UseMutationResult<TData, TError, TVariables, TContext>
): boolean => {
  return mutationResult.isPending === true;
};

export const isMutationError = <TData, TError, TVariables, TContext>(
  mutationResult: UseMutationResult<TData, TError, TVariables, TContext>
): boolean => {
  return mutationResult.error !== null && mutationResult.error !== undefined;
};

export const getQueryStatus = <TData>(
  result:
    | UseQueryResult<TData, unknown>
    | UseMutationResult<TData, unknown, unknown, unknown>
    | {
        data?: TData | null;
        isLoading?: boolean;
        isFetching?: boolean;
        isPending?: boolean;
        error?: unknown;
      }
): QueryStatus => {
  if (isQueryResult(result)) {
    const queryResult = result as UseQueryResult<TData, unknown>;
    const hasError = isQueryError(queryResult);
    const isEmpty = !hasError && isEmptyData(queryResult.data);

    return {
      isLoading: queryResult.isLoading ?? false,
      isFetching: queryResult.isFetching ?? false,
      isPending: false,
      hasError,
      isEmpty,
      isAnyLoading:
        queryResult.isLoading === true || queryResult.isFetching === true,
    };
  }

  if (isMutationResult(result)) {
    const mutationResult = result as UseMutationResult<
      TData,
      unknown,
      unknown,
      unknown
    >;
    const hasError = isMutationError(mutationResult);
    const isEmpty = !hasError && isEmptyData(mutationResult.data);

    return {
      isLoading: false,
      isFetching: false,
      isPending: mutationResult.isPending ?? false,
      hasError,
      isEmpty,
      isAnyLoading: mutationResult.isPending === true,
    };
  }

  const hasError = result.error !== null && result.error !== undefined;
  const isEmpty = !hasError && isEmptyData(result.data);

  return {
    isLoading: result.isLoading ?? false,
    isFetching: result.isFetching ?? false,
    isPending: result.isPending ?? false,
    hasError,
    isEmpty,
    isAnyLoading:
      result.isLoading === true ||
      result.isFetching === true ||
      result.isPending === true,
  };
};

export const shouldShowLoading = <TData>(
  result:
    | UseQueryResult<TData, unknown>
    | UseMutationResult<TData, unknown, unknown, unknown>
    | {
        isLoading?: boolean;
        isFetching?: boolean;
        isPending?: boolean;
      }
): boolean => {
  const status = getQueryStatus(result);
  return status.isLoading || status.isPending;
};

export const shouldShowError = <TData>(
  result:
    | UseQueryResult<TData, unknown>
    | UseMutationResult<TData, unknown, unknown, unknown>
    | {
        error?: unknown;
        data?: TData | null;
      }
): boolean => {
  const status = getQueryStatus(result);
  return status.hasError;
};

export const shouldShowEmpty = <TData>(
  result:
    | UseQueryResult<TData, unknown>
    | UseMutationResult<TData, unknown, unknown, unknown>
    | {
        data?: TData | null;
        isLoading?: boolean;
        isFetching?: boolean;
        isPending?: boolean;
        error?: unknown;
      }
): boolean => {
  const status = getQueryStatus(result);
  return !status.isAnyLoading && !status.hasError && status.isEmpty;
};
