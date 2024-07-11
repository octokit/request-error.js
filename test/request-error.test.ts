import { describe, test, expect } from "vitest";
import { RequestError } from "../src/index.js";
import type { RequestErrorOptions } from "../src/types.js";

const mockOptions: RequestErrorOptions = {
  request: {
    method: "GET",
    url: "https://api.github.com/",
    headers: {},
  },
  response: {
    headers: {},
    status: 200,
    url: "https://api.github.com/",
    data: {},
  },
};

describe("RequestError", () => {
  test("inherits from Error", () => {
    const error = new RequestError("test", 123, mockOptions);
    expect(error).toBeInstanceOf(Error);
  });

  test("sets .name to 'RequestError'", () => {
    const error = new RequestError("test", 123, mockOptions);
    expect(error.name).toBe("HttpError");
  });

  test("sets .message", () => {
    expect(new RequestError("test", 123, mockOptions).message).toEqual("test");
    expect(new RequestError("foo", 123, mockOptions).message).toEqual("foo");
  });

  test("sets .status", () => {
    expect(new RequestError("test", 123, mockOptions).status).toEqual(123);
    expect(new RequestError("test", 404, mockOptions).status).toEqual(404);
    // @ts-expect-error
    expect(new RequestError("test", "404", mockOptions).status).toEqual(404);
    expect(new RequestError("test", NaN, mockOptions).status).toEqual(0);
    // @ts-expect-error
    expect(new RequestError("test", [], mockOptions).status).toEqual(0);
    // @ts-expect-error
    expect(new RequestError("test", new Date(), mockOptions).status).toEqual(0);
  });

  test("sets .request", () => {
    const options = Object.assign({}, mockOptions, {
      request: {
        method: "POST",
        url: "https://api.github.com/authorizations",
        body: {
          note: "test",
        },
        headers: {
          authorization: "token secret123",
        },
      },
    });

    expect(new RequestError("test", 123, options).request).toEqual({
      method: "POST",
      url: "https://api.github.com/authorizations",
      body: {
        note: "test",
      },
      headers: {
        authorization: "token [REDACTED]",
      },
    });
  });

  test("redacts credentials from error.request.url", () => {
    const options = Object.assign({}, mockOptions, {
      request: {
        method: "GET",
        url: "https://api.github.com/?client_id=123&client_secret=secret123",
        headers: {},
      },
    });

    const error = new RequestError("test", 123, options);

    expect(error.request.url).toEqual(
      "https://api.github.com/?client_id=123&client_secret=[REDACTED]",
    );
  });

  test("redacts client_secret from error.request.url", () => {
    const options = Object.assign({}, mockOptions, {
      request: {
        method: "GET",
        url: "https://api.github.com/?client_id=123&client_secret=secret123",
        headers: {},
      },
    });

    const error = new RequestError("test", 123, options);

    expect(error.request.url).toEqual(
      "https://api.github.com/?client_id=123&client_secret=[REDACTED]",
    );
  });

  test("redacts access_token from error.request.url", () => {
    const options = Object.assign({}, mockOptions, {
      request: {
        method: "GET",
        url: "https://api.github.com/?access_token=secret123",
        headers: {},
      },
    });

    const error = new RequestError("test", 123, options);

    expect(error.request.url).toEqual(
      "https://api.github.com/?access_token=[REDACTED]",
    );
  });

  test("error.response", () => {
    const error = new RequestError("test", 123, {
      request: mockOptions.request,
      response: {
        url: mockOptions.request.url,
        status: 404,
        data: {
          error: "Not Found",
        },
        headers: {
          "x-github-request-id": "1",
        },
      },
    });

    expect(error.response).toStrictEqual({
      data: {
        error: "Not Found",
      },
      headers: {
        "x-github-request-id": "1",
      },
      status: 404,
      url: "https://api.github.com/",
    });
  });
});
