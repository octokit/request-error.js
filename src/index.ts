const { Deprecation } = require("deprecation");
const once = require("once");
const logOnceCode = once((deprecation: any) => console.warn(deprecation));
const logOnceHeaders = once((deprecation: any) => console.warn(deprecation));

import type {
  RequestOptions,
  ResponseHeaders,
  OctokitResponse,
} from "@octokit/types";
import type { RequestErrorOptions } from "./types";

/**
 * Error with extra properties to help with debugging
 */
class RequestError extends Error {
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
   * Request options that lead to the error.
   */
  request: RequestOptions;

  /**
   * error response headers
   *
   * @deprecated `error.headers` is deprecated in favor of `error.response.headers`
   */
  headers!: ResponseHeaders;

  /**
   * Response object if a response was received
   */
  response?: OctokitResponse<unknown>;

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
    let headers: ResponseHeaders;

    if ("headers" in options && typeof options.headers !== "undefined") {
      headers = options.headers;
    }

    if ("response" in options) {
      this.response = options.response;
      headers = options.response.headers;
    }

    // redact request credentials without mutating original request options
    const requestCopy = Object.assign({}, options.request);
    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(
          / .*$/,
          " [REDACTED]"
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

    // deprecations
    Object.defineProperty(this, "code", {
      get() {
        logOnceCode(
          new Deprecation(
            "[@octokit/request-error] `error.code` is deprecated, use `error.status`."
          )
        );
        return statusCode;
      },
    });
    Object.defineProperty(this, "headers", {
      get() {
        logOnceHeaders(
          new Deprecation(
            "[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`."
          )
        );
        return headers || {};
      },
    });
  }
}

module.exports.RequestError = RequestError;
