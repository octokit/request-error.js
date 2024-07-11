import { Bench } from 'tinybench';
import { RequestError } from "../pkg/dist-src/index.js";

const bench = new Bench({ time: 100 });

const optionsWithSimpleRequest = Object.assign({}, {
  request: {
    method: "POST",
    url: "https://api.github.com/authorizations",
    headers: {},
    body: {
      note: "test",
    },
  },
  response: {
    headers: {},
    status: 200,
    url: "https://api.github.com/",
    data: {},
  }
});

const optionsWithRequestHavingClientSecretInQuery = Object.assign({}, {
  request: {
    method: "POST",
    url: "https://api.github.com/authorizations?client_secret=secret",
    headers: {},
    body: {
      note: "test",
    },
  },
  response: {
    headers: {},
    status: 200,
    url: "https://api.github.com/",
    data: {},
  }
});

const optionsWithRequestHavingAuthorizationHeader = Object.assign({}, {
  request: {
    method: "POST",
    url: "https://api.github.com/authorizations",
    headers: {
      authorization: "token secret123",
    },
    body: {
      note: "test",
    },
  },
  response: {
    headers: {},
    status: 200,
    url: "https://api.github.com/",
    data: {},
  }
});

bench
.add('instantiate a simple RequestError', () => {
  new RequestError("test", 123, optionsWithSimpleRequest)
})
.add('instantiate a RequestError with authorization header in header', () => {
  new RequestError("test", 123, optionsWithRequestHavingAuthorizationHeader)
})
.add('instantiate a RequestError with client_secret in query', () => {
  new RequestError("test", 123, optionsWithRequestHavingClientSecretInQuery)
})

await bench.warmup(); // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
await bench.run();

console.table(bench.table());
