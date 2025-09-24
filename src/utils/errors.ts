import { AxiosError } from "axios";

/**
 * All possible error codes thrown by the ytsearch.js package.
 */
export type YtSearchErrorCode =
  | "INVALID_QUERY"
  | "INVALID_TYPE"
  | "INVALID_SORT"
  | "INVALID_LIMIT"
  | "PARSE_ERROR"
  | "NO_RESULTS"
  | "RATE_LIMIT"
  | "YOUTUBE_ERROR"
  | "YOUTUBE_UNAVAILABLE"
  | "NETWORK_UNAVAILABLE"
  | "INVALID_PLAYLIST"
  | "NO_PLAYLIST_RESULTS"
  | "INVALID_VIDEO"
  | "UNKNOWN";

/**
 * Custom error class for ytsearch.js
 */
export class YtSearchError extends Error {
  public code: YtSearchErrorCode;
  public metadata?: Record<string, any> | undefined;

  constructor(
    code: YtSearchErrorCode,
    message: string,
    metadata?: Record<string, any> | undefined
  ) {
    super(message);
    this.name = "YtSearchError";
    this.code = code;
    this.metadata = metadata;

    // Maintain stack trace
     if (typeof (Error as any).captureStackTrace === "function") {
       (Error as any).captureStackTrace(this, YtSearchError);
     }
  }
}

/**
 * Wraps axios errors into standardized YtSearchError
 */
export function handleAxiosError(
  err: unknown,
  context: Record<string, any>
): never {
  if (err instanceof AxiosError) {
    if (err.code === "ECONNABORTED" || err.code === "ENOTFOUND") {
      throw new YtSearchError("NETWORK_UNAVAILABLE", "Network unavailable", {
        ...context,
        axiosCode: err.code,
        originalError: err,
      });
    }

    if (err.response?.status === 429) {
      throw new YtSearchError("RATE_LIMIT", "YouTube rate limit exceeded", {
        ...context,
        status: 429,
        originalError: err,
      });
    }

    if (err.response?.status && err.response.status >= 500) {
      throw new YtSearchError(
        "YOUTUBE_UNAVAILABLE",
        "YouTube service unavailable",
        {
          ...context,
          status: err.response.status,
          originalError: err,
        }
      );
    }
  }

  // Unknown or unexpected error
  throw new YtSearchError(
    "UNKNOWN",
    "Unknown error occurred during network request",
    {
      ...context,
      originalError: err,
    }
  );
}
