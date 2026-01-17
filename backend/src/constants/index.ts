export const HTTP_STATUS = {
  // 2xx — Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // 3xx — Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx — Client errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // 5xx — Server errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export const HTTP_REASON_PHRASE: Record<HttpStatusCode, string> = {
  // 2xx
  200: "OK",
  201: "Created",
  204: "No Content",

  // 3xx
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",

  // 4xx
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",

  // 5xx
  500: "Internal Server Error",
  501: "Not Implemented",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};
