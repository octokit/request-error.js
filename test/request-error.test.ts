import { HttpError } from "../src";
import { HttpErrorOptions } from "../src/types";

const mockOptions: HttpErrorOptions = {
  headers: {},
  request: {
    method: "GET",
    url: "https://api.github.com/",
    headers: {}
  }
};

describe("HttpError", () => {
  it("inherits from Error", () => {
    const error = new HttpError("test", 123, mockOptions);
    expect(error).toBeInstanceOf(Error);
  });

  it("sets .name to 'HttpError'", () => {
    const error = new HttpError("test", 123, mockOptions);
    expect(error.name).toBe("HttpError");
  });

  it("sets .message", () => {
    expect(new HttpError("test", 123, mockOptions).message).toEqual("test");
    expect(new HttpError("foo", 123, mockOptions).message).toEqual("foo");
  });

  it("sets .status", () => {
    expect(new HttpError("test", 123, mockOptions).status).toEqual(123);
    expect(new HttpError("test", 404, mockOptions).status).toEqual(404);
  });

  it("sets .headers", () => {
    const options = Object.assign({}, mockOptions, {
      headers: {
        foo: "bar"
      }
    });
    expect(new HttpError("test", 123, options).headers).toEqual({
      foo: "bar"
    });
  });

  it("sets .request", () => {
    const options = Object.assign({}, mockOptions, {
      request: {
        method: "POST",
        url: "https://api.github.com/authorizations",
        body: {
          note: "test"
        },
        headers: {
          authorization: "token secret123"
        }
      }
    });

    expect(new HttpError("test", 123, options).request).toEqual({
      method: "POST",
      url: "https://api.github.com/authorizations",
      body: {
        note: "test"
      },
      headers: {
        authorization: "token [REDACTED]"
      }
    });
  });

  it("deprecates .code", () => {
    global.console.warn = jest.fn();
    expect(new HttpError("test", 123, mockOptions).code).toEqual(123);
    expect(new HttpError("test", 404, mockOptions).code).toEqual(404);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});
