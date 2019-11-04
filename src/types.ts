import { RequestOptions, ResponseHeaders } from "@octokit/types";

export type RequestErrorOptions = {
  headers?: ResponseHeaders;
  request: RequestOptions;
};
