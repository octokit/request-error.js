import type { RequestOptions, OctokitResponse } from "@octokit/types";
import type { RequestErrorOptions } from "./types.js";

/**
 * Error with extra properties to help with debugging
 */
export class RequestError extends Error {
  name: "HttpError";

  /**
   * http status code
   */
  status: number;

  /**
   * Request options that lead to the error.
   */
  request: RequestOptions;

  /**
   * Response object if a response was received
   */
  response?: OctokitResponse<unknown>;

  constructor(
    message: string,
    statusCode: number,
    options: RequestErrorOptions,
  ) {
    super(message);

    // Maintains proper stack trace (only available on V8)
    /* istanbul ignore next */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = "HttpError";
    this.status = statusCode;

    if ("response" in options) {
      this.response = options.response;
    }

    // redact request credentials without mutating original request options
    const requestCopy = Object.assign({}, options.request);
    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(
          / .*$/,
          " [REDACTED]",
        ),
      });
    }

    requestCopy.url = requestCopy.url
      // client_id & client_secret can be passed as URL query parameters to increase rate limit
      // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
      .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]")
      // OAuth tokens can be passed as URL query parameters, although it is not recommended
      // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
      .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");

    this.request = requestCopy;
  }
}
