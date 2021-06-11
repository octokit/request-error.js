import { RequestError } from "../src";
import { RequestErrorOptions } from "../src/types";

const mockOptions: RequestErrorOptions = {
  request: {
    method: "GET",
    url: "https://api.github.com/",
    headers: {},
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
  });

  test("sets .headers", () => {
    const options = Object.assign({}, mockOptions, {
      headers: {
        foo: "bar",
      },
    });
    expect(new RequestError("test", 123, options).headers).toEqual({
      foo: "bar",
    });
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
      "https://api.github.com/?client_id=123&client_secret=[REDACTED]"
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
      "https://api.github.com/?client_id=123&client_secret=[REDACTED]"
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
      "https://api.github.com/?access_token=[REDACTED]"
    );
  });

  test("deprecates .code", () => {
    global.console.warn = jest.fn();
    expect(new RequestError("test", 123, mockOptions).code).toEqual(123);
    expect(new RequestError("test", 404, mockOptions).code).toEqual(404);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});
