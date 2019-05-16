/**
 * Relative or absolute URL. Examples: `'/orgs/:org'`, `https://example.com/foo/bar`
 */
export type Url = string;

/**
 * Request method
 */
export type Method = "DELETE" | "GET" | "HEAD" | "PATCH" | "POST" | "PUT";

export type RequestHeaders = {
  /**
   * Used for API previews and custom formats
   */
  accept?: string;
  /**
   * Redacted authorization header
   */
  authorization?: string;

  "user-agent"?: string;

  [header: string]: string | number | undefined;
};

export type ResponseHeaders = {
  [header: string]: string;
};

export type EndpointRequestOptions = {
  [option: string]: any;
};

export type RequestOptions = {
  method: Method;
  url: Url;
  headers: RequestHeaders;
  body?: any;
  request?: EndpointRequestOptions;
};

export type RequestErrorOptions = {
  headers: ResponseHeaders;
  request: RequestOptions;
};
