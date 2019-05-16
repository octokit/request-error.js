import { Deprecation } from "deprecation";
import once from "once";
const logOnce = once((deprecation: any) => console.warn(deprecation));

import { RequestOptions, ResponseHeaders, RequestErrorOptions } from "./types";

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
   * http status code
   *
   * @deprecated `error.code` is deprecated in favor of `error.status`
   */
  code!: number;

  /**
   * error response headers
   */
  headers: ResponseHeaders;

  /**
   * Request options that lead to the error.
   */
  request: RequestOptions;

  constructor(
    message: string,
    statusCode: number,
    options: RequestErrorOptions
  ) {
    super(message);

    // Maintains proper stack trace (only available on V8)
    /* istanbul ignore next */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = "HttpError";
    this.status = statusCode;
    Object.defineProperty(this, "code", {
      get() {
        logOnce(
          new Deprecation(
            "[@octokit/request-error] `error.code` is deprecated, use `error.status`."
          )
        );
        return statusCode;
      }
    });
    this.headers = options.headers;

    // redact request credentials without mutating original request options
    const requestCopy = Object.assign({}, options.request);
    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(
          / .*$/,
          " [REDACTED]"
        )
      });
    }

    // client_id & client_secret can be passed as URL query parameters to increase rate limit
    // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
    requestCopy.url = requestCopy.url.replace(
      /\bclient_secret=\w+/g,
      "client_secret=[REDACTED]"
    );

    this.request = requestCopy;
  }
}
